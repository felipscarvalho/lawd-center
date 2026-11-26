/** Recorte em pixels da imagem original */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Recorte atual junto com o tamanho da imagem original (usado pela prévia) */
export interface ImageCrop {
  area: CropArea;
  imageWidth: number;
  imageHeight: number;
}

interface CropImageOptions {
  /** Maior lado da imagem gerada; recortes menores mantêm o tamanho original */
  maxSize?: number;
  /** Nome base do arquivo gerado (a extensão vem do formato) */
  fileName?: string;
  quality?: number;
}

const extensions: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    image.src = src;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    // Navegadores sem codificador WebP devolvem PNG, que o backend também aceita
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível gerar a imagem."))),
      "image/webp",
      quality,
    );
  });

/** Nome do arquivo sem a extensão, para o recorte manter a referência do original */
export const baseFileName = (name: string) => name.replace(/\.[^.]+$/, "") || "image";

/** Desenha o recorte num canvas e devolve como arquivo, pronto para enviar ao backend */
export async function cropImage(src: string, area: CropArea, options: CropImageOptions = {}): Promise<File> {
  const { maxSize = 1024, fileName = "image", quality = 0.92 } = options;

  const image = await loadImage(src);

  const ratio = Math.min(1, maxSize / Math.max(area.width, area.height));
  const width = Math.max(1, Math.round(area.width * ratio));
  const height = Math.max(1, Math.round(area.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) throw new Error("Não foi possível gerar a imagem.");

  context.imageSmoothingQuality = "high";
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, quality);
  const extension = extensions[blob.type] ?? "png";

  return new File([blob], `${fileName}.${extension}`, { type: blob.type });
}
