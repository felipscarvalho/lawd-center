"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, SyntheticEvent } from "react";
import { ZoomIn, ZoomOut } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Slider } from "@/components/base/slider/slider";
import type { ImageCrop } from "@/lib/image_crop";
import { cx } from "@/utils/cx";

// A moldura ocupa 84% da área; a borda mostra, escurecido, o que fica fora do recorte
const framePercent = 0.84;
const zoomButtonStep = 0.25;
const wheelZoomSpeed = 0.002;
const keyboardPanStep = 12;

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

/** Zoom (1 = recorte do maior tamanho possível) e centro do recorte em pixels da imagem original */
interface View {
  zoom: number;
  center: Position;
}

export interface ImageCropperProps {
  src: string;
  /** Proporção largura/altura do recorte */
  aspect?: number;
  /** Formato da moldura. Só visual: o arquivo gerado é sempre retangular */
  shape?: "rect" | "round";
  maxZoom?: number;
  onCropChange: (crop: ImageCrop) => void;
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const distance = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.y - b.y);

/** Recorte no zoom 1: o maior retângulo da proporção pedida que cabe na imagem */
const getBaseCropSize = (image: Size, aspect: number): Size =>
  image.width / image.height > aspect
    ? { width: image.height * aspect, height: image.height }
    : { width: image.width, height: image.width / aspect };

/** Mantém o zoom no intervalo e a moldura sempre coberta pela imagem */
const clampView = (view: View, image: Size, aspect: number, maxZoom: number): View => {
  const zoom = clamp(view.zoom, 1, maxZoom);
  const base = getBaseCropSize(image, aspect);
  const halfWidth = base.width / zoom / 2;
  const halfHeight = base.height / zoom / 2;

  const center = {
    x: clamp(view.center.x, halfWidth, image.width - halfWidth),
    y: clamp(view.center.y, halfHeight, image.height - halfHeight),
  };

  return { zoom, center };
};

const toCrop = (view: View, image: Size, aspect: number): ImageCrop => {
  const base = getBaseCropSize(image, aspect);
  const width = base.width / view.zoom;
  const height = base.height / view.zoom;

  const area = { x: view.center.x - width / 2, y: view.center.y - height / 2, width, height };

  return { area, imageWidth: image.width, imageHeight: image.height };
};

/**
 * Área de recorte no estilo do WhatsApp: a imagem se move por baixo de uma moldura fixa e o que fica
 * fora dela aparece escurecido. Arrastar (mouse ou toque) move, e o zoom vem do controle deslizante,
 * da roda do mouse, da pinça ou das teclas + e -. O recorte atual sai por `onCropChange`.
 */
export function ImageCropper({
  src,
  aspect = 1,
  shape = "rect",
  maxZoom = 4,
  onCropChange,
  className,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Position>());
  const [containerWidth, setContainerWidth] = useState(0);
  const [image, setImage] = useState<Size | null>(null);
  const [view, setView] = useState<View>({ zoom: 1, center: { x: 0, y: 0 } });
  const [isDragging, setIsDragging] = useState(false);

  // Cópia da visão atual para os eventos de ponteiro e roda, que chegam várias vezes antes do render
  const viewRef = useRef(view);

  const commit = useCallback(
    (next: View) => {
      if (!image) return;

      const clamped = clampView(next, image, aspect, maxZoom);

      viewRef.current = clamped;
      setView(clamped);
      onCropChange(toCrop(clamped, image, aspect));
    },
    [image, aspect, maxZoom, onCropChange],
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // A roda precisa de listener não passivo para impedir a rolagem da página durante o zoom
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const current = viewRef.current;
      commit({ ...current, zoom: current.zoom * Math.exp(-event.deltaY * wheelZoomSpeed) });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => container.removeEventListener("wheel", handleWheel);
  }, [commit]);

  /** Pixels de tela por pixel da imagem no zoom informado */
  const getScale = (zoom: number) => {
    if (!image) return 1;

    const base = getBaseCropSize(image, aspect);

    return (containerWidth * framePercent * zoom) / base.width;
  };

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const size = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight };
    const initial = { zoom: 1, center: { x: size.width / 2, y: size.height / 2 } };

    viewRef.current = initial;
    setImage(size);
    setView(initial);
    onCropChange(toCrop(initial, size, aspect));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!image) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId);

    if (!previous) return;

    const position = { x: event.clientX, y: event.clientY };
    const current = viewRef.current;
    const scale = getScale(current.zoom);
    const other = [...pointers.current].find(([id]) => id !== event.pointerId)?.[1];

    if (other) {
      // Pinça: o zoom acompanha a distância entre os dedos e o ponto médio arrasta a imagem
      const zoom = current.zoom * (distance(position, other) / Math.max(distance(previous, other), 1));
      const center = {
        x: current.center.x - (position.x - previous.x) / 2 / scale,
        y: current.center.y - (position.y - previous.y) / 2 / scale,
      };

      commit({ zoom, center });
    } else {
      const center = {
        x: current.center.x - (position.x - previous.x) / scale,
        y: current.center.y - (position.y - previous.y) / scale,
      };

      commit({ zoom: current.zoom, center });
    }

    pointers.current.set(event.pointerId, position);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);

    if (pointers.current.size === 0) setIsDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = keyboardPanStep / getScale(view.zoom);
    const moves: Record<string, Position> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };

    const move = moves[event.key];

    if (move) {
      event.preventDefault();
      commit({ zoom: view.zoom, center: { x: view.center.x + move.x, y: view.center.y + move.y } });
      return;
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      commit({ ...view, zoom: view.zoom + zoomButtonStep });
    } else if (event.key === "-") {
      event.preventDefault();
      commit({ ...view, zoom: view.zoom - zoomButtonStep });
    }
  };

  const scale = getScale(view.zoom);
  const isReady = Boolean(image) && containerWidth > 0;
  const translateX = containerWidth / 2 - view.center.x * scale;
  const translateY = containerWidth / aspect / 2 - view.center.y * scale;

  return (
    <div className={cx("flex flex-col gap-4", className)}>
      <div
        ref={containerRef}
        role="group"
        tabIndex={0}
        aria-label="Área de recorte: arraste ou use as setas para mover e as teclas + e - para o zoom"
        className={cx(
          "relative w-full touch-none overflow-hidden rounded-xl bg-overlay select-none outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ aspectRatio: aspect }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {/* Imagem local (arquivo escolhido); não passa pelo otimizador do Next */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          onLoad={handleImageLoad}
          className={cx("absolute top-0 left-0 max-w-none origin-top-left", !isReady && "opacity-0")}
          style={
            image
              ? {
                  width: image.width * scale,
                  height: image.height * scale,
                  transform: `translate(${translateX}px, ${translateY}px)`,
                }
              : undefined
          }
        />

        {/* Moldura: a sombra gigante escurece tudo fora dela */}
        <div
          aria-hidden
          className={cx(
            "pointer-events-none absolute inset-[8%] shadow-[0_0_0_9999px_color-mix(in_srgb,var(--color-bg-overlay)_65%,transparent)] ring-2 ring-white/80",
            shape === "round" ? "rounded-full" : "rounded-lg",
          )}
        >
          {/* Grade de terços enquanto arrasta, como nos apps de foto */}
          {isDragging && shape === "rect" && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }, (_, index) => (
                <div key={index} className="border-[0.5px] border-white/30" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ButtonUtility
          color="tertiary"
          icon={ZoomOut}
          tooltip="Diminuir zoom"
          isDisabled={!image || view.zoom <= 1}
          onClick={() => commit({ ...view, zoom: view.zoom - zoomButtonStep })}
        />

        <Slider
          aria-label="Zoom"
          minValue={1}
          maxValue={maxZoom}
          step={0.01}
          value={view.zoom}
          onChange={(zoom) => commit({ ...view, zoom: Array.isArray(zoom) ? zoom[0] : zoom })}
          isDisabled={!image}
          className="flex-1"
        />

        <ButtonUtility
          color="tertiary"
          icon={ZoomIn}
          tooltip="Aumentar zoom"
          isDisabled={!image || view.zoom >= maxZoom}
          onClick={() => commit({ ...view, zoom: view.zoom + zoomButtonStep })}
        />
      </div>
    </div>
  );
}

interface ImageCropPreviewProps {
  src: string;
  crop: ImageCrop | null;
  /** Tamanho e formato da prévia (ex.: `size-12 rounded-full`) */
  className?: string;
}

/** Mostra o recorte como ele vai aparecer, em qualquer tamanho: só CSS, sem gerar a imagem */
export function ImageCropPreview({ src, crop, className }: ImageCropPreviewProps) {
  if (!crop) return <div className={cx("bg-quaternary", className)} />;

  const { area, imageWidth, imageHeight } = crop;

  return (
    <div className={cx("relative overflow-hidden bg-quaternary", className)} style={{ aspectRatio: area.width / area.height }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute max-w-none"
        style={{
          width: `${(imageWidth / area.width) * 100}%`,
          height: `${(imageHeight / area.height) * 100}%`,
          left: `${(-area.x / area.width) * 100}%`,
          top: `${(-area.y / area.height) * 100}%`,
        }}
      />
    </div>
  );
}
