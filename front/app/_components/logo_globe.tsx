"use client";

import { useEffect, useRef, type RefObject } from "react";
import { cx } from "@/utils/cx";

/*
 * Logo da LAWD como uma esfera 3D, desenhada em canvas 2D (sem biblioteca 3D).
 * A esfera é uma casca roxa oca e os traços brancos do logo são recortes nela: os três nós do logo ficam
 * numa face, e os traços que no logo chegam à borda continuam até outros nós espalhados pelo resto da
 * esfera, formando uma rede só. Pelos recortes aparece o interior escuro da casca. Em volta dela há
 * órbitas finas com pontos de conexão circulando.
 * O canvas cobre o hero inteiro e a esfera sobe de baixo, cortada pela borda: só a calota de cima
 * aparece, girando sozinha; dá para girar arrastando com o mouse ou o dedo.
 */

type Vec3 = readonly [number, number, number];
type Rgb = readonly [number, number, number];
type Matrix = readonly [number, number, number, number, number, number, number, number, number];

/** Distância da câmera em raios da esfera (define a perspectiva) */
const CAMERA_DISTANCE = 3.4;
/** Meia largura dos traços recortados, em radianos sobre a esfera */
const BAND_HALF_WIDTH = 0.05;
/** Raio do miolo cheio de cada nó e raio externo do anel recortado em volta dele, em radianos */
const NODE_CORE_ANGLE = 0.125;
const NODE_RING_ANGLE = 0.225;
/** Raio da face de dentro da casca em relação ao de fora (a diferença é a espessura que aparece nos recortes) */
const INNER_SHELL_SCALE = 0.965;
/** Segundos para uma volta completa */
const TURN_SECONDS = 90;
/** Segundos da animação de entrada: a esfera sobe, aparece e desacelera o giro, enquanto as órbitas se desenham */
const INTRO_SECONDS = 2.6;
/** Quantas vezes mais rápido que o normal a esfera gira no primeiro instante da entrada */
const INTRO_SPIN_BOOST = 24;
/** Quanto a esfera começa abaixo do lugar dela, em raios */
const INTRO_RISE = 0.1;
/** Inclinação inicial: leva a face do logo para a calota visível, no alto da esfera */
const INITIAL_TILT = -0.85;
/** Avanço inicial do giro: negativo, para o logo terminar de chegar durante a entrada */
const START_ANGLE = -0.85;
/** Segundos para o giro automático voltar à velocidade normal depois que a pessoa solta a esfera */
const SPIN_RESUME_SECONDS = 2;
/** Quanto do impulso do arrasto se perde por segundo depois de soltar (decaimento exponencial) */
const DRAG_FRICTION = 3.5;
/** Contorno aparente da esfera em relação ao raio, por causa da perspectiva */
const SILHOUETTE_RATIO = CAMERA_DISTANCE / Math.sqrt(CAMERA_DISTANCE ** 2 - 1);
/** Lado máximo do canvas em pixels reais: acima disso o ganho de nitidez não compensa o custo por quadro */
const MAX_BACKING_SIZE = 2400;

/**
 * Órbitas em volta da esfera: raio (em raios da esfera), inclinação do plano (dois ângulos) e os pontos
 * de conexão que circulam nela, cada um com a posição inicial e a velocidade em radianos por segundo.
 */
const ORBITS = [
  { radius: 1.07, tilt: [0.35, 0.15], travelers: [[0.4, 0.16], [3.4, 0.16]] },
  { radius: 1.11, tilt: [-0.6, 0.5], travelers: [[2.1, -0.12]] },
  { radius: 1.15, tilt: [1.1, -0.3], travelers: [[4.0, 0.2], [0.9, 0.2]] },
  { radius: 1.19, tilt: [-1.25, -0.6], travelers: [[1.0, -0.17]] },
  { radius: 1.1, tilt: [0.9, 1.0], travelers: [[3.2, 0.14]] },
  { radius: 1.22, tilt: [0.1, -1.1], travelers: [[5.0, -0.1], [2.2, -0.1]] },
] as const;
/** Pontos que desenham cada órbita */
const ORBIT_STEPS = 160;

// Tons da paleta brand de styles/lawd-theme.css, em RGB porque o canvas monta os degradês em código
const BRAND_200: Rgb = [225, 214, 255];
const BRAND_300: Rgb = [205, 184, 255];
const BRAND_400: Rgb = [181, 141, 255];
const BRAND_500: Rgb = [159, 95, 255];
const BRAND_600: Rgb = [139, 69, 250];
const BRAND_700: Rgb = [115, 48, 212];
const BRAND_800: Rgb = [92, 41, 170];
const BRAND_900: Rgb = [70, 34, 129];
const BRAND_950: Rgb = [44, 20, 85];
/** Fundo do interior da casca: o brand-950 escurecido, sem equivalente na paleta */
const INTERIOR_SHADOW: Rgb = [20, 9, 40];
const WHITE: Rgb = [255, 255, 255];

const rgba = (color: Rgb, alpha = 1) => `rgb(${color[0]} ${color[1]} ${color[2]} / ${alpha})`;

const scale = (v: Vec3, k: number): Vec3 => [v[0] * k, v[1] * k, v[2] * k];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (v: Vec3): Vec3 => scale(v, 1 / Math.hypot(v[0], v[1], v[2]));

const multiply = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
  a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
  a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
  a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
  a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
  a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
  a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
  a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
  a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
];
const apply = (m: Matrix, v: Vec3): Vec3 => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
];
const rotationX = (angle: number): Matrix => [
  1, 0, 0,
  0, Math.cos(angle), -Math.sin(angle),
  0, Math.sin(angle), Math.cos(angle),
];
const rotationY = (angle: number): Matrix => [
  Math.cos(angle), 0, Math.sin(angle),
  0, 1, 0,
  -Math.sin(angle), 0, Math.cos(angle),
];
const rotationZ = (angle: number): Matrix => [
  Math.cos(angle), -Math.sin(angle), 0,
  Math.sin(angle), Math.cos(angle), 0,
  0, 0, 1,
];

/** Corrige o acúmulo de erro de ponto flutuante de uma rotação multiplicada a cada quadro */
function orthonormalize(m: Matrix): Matrix {
  const x = normalize([m[0], m[1], m[2]]);
  const y = normalize(add([m[3], m[4], m[5]], scale(x, -dot([m[3], m[4], m[5]], x))));
  const z = cross(x, y);

  return [...x, ...y, ...z] as unknown as Matrix;
}

/** Rotação de `angle` radianos em torno do eixo unitário `axis` */
function rotationAround(axis: Vec3, angle: number): Matrix {
  const [x, y, z] = axis;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;

  return [
    t * x * x + c, t * x * y - s * z, t * x * z + s * y,
    t * x * y + s * z, t * y * y + c, t * y * z - s * x,
    t * x * z - s * y, t * y * z + s * x, t * z * z + c,
  ];
}

/**
 * Eixo do giro automático, no espaço da tela: quase horizontal, para o desenho surgir por trás do
 * horizonte e vir em direção a quem olha; a leve inclinação faz o movimento correr em diagonal.
 */
const SPIN_AXIS = normalize([1, 0.22, 0.12]);

/** Ponto da face da frente da esfera a partir da posição dele no logo (x para a direita, y para cima) */
const onFront = (x: number, y: number): Vec3 => [x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y))];

/** Recorte na casca, ainda no referencial do logo: as duas bordas e o teste de um ponto da esfera estar dentro dele */
interface Cut {
  left: Vec3[];
  right: Vec3[];
  contains: (point: Vec3) => boolean;
}

/** Recorte pronto para desenhar: bordas com o mesmo número de pontos (x, y, z em sequência) e as paredes delas */
interface Strip {
  left: Float32Array;
  right: Float32Array;
  /** Trechos contínuos de borda que têm parede */
  walls: Float32Array[];
}

/** Folga dos testes de "dentro do recorte", para a borda de um recorte não contar como dentro do vizinho */
const EPSILON = 1e-4;

/** Traço ao longo do círculo máximo que sai de `from` na direção de `toward`, entre os ângulos `start` e `end` */
function bandCut(from: Vec3, toward: Vec3, start: number, end: number, steps: number): Cut {
  const tangent = normalize(add(toward, scale(from, -dot(toward, from))));
  const normal = cross(from, tangent);
  const side = scale(normal, Math.sin(BAND_HALF_WIDTH));
  const left: Vec3[] = [];
  const right: Vec3[] = [];

  for (let index = 0; index <= steps; index++) {
    const angle = start + ((end - start) * index) / steps;
    const along = add(scale(from, Math.cos(angle)), scale(tangent, Math.sin(angle)));
    const center = scale(along, Math.cos(BAND_HALF_WIDTH));

    left.push(add(center, side));
    right.push(add(center, scale(side, -1)));
  }

  const contains = (point: Vec3) => {
    const along = Math.atan2(dot(point, tangent), dot(point, from));
    const across = Math.asin(dot(point, normal));

    return along > start && along < end && Math.abs(across) < BAND_HALF_WIDTH - EPSILON;
  };

  return { left, right, contains };
}

/** Anel em volta de um nó: a faixa entre dois círculos menores da esfera */
function ringCut(center: Vec3, steps: number): Cut {
  const u = normalize(cross(center, [0, 1, 0]));
  const v = cross(center, u);
  const circle = (radius: number) =>
    Array.from({ length: steps + 1 }, (_, index) => {
      const angle = (2 * Math.PI * index) / steps;
      const around = add(scale(u, Math.cos(angle)), scale(v, Math.sin(angle)));

      return add(scale(center, Math.cos(radius)), scale(around, Math.sin(radius)));
    });

  const contains = (point: Vec3) => {
    const distance = Math.acos(Math.min(1, Math.max(-1, dot(point, center))));

    return distance > NODE_CORE_ANGLE + EPSILON && distance < NODE_RING_ANGLE - EPSILON;
  };

  return { left: circle(NODE_CORE_ANGLE), right: circle(NODE_RING_ANGLE), contains };
}

/**
 * Trechos de uma borda que têm parede: os que não ficam dentro de outro recorte. Onde dois recortes se
 * emendam a parede acaba exatamente na divisa (achada por bisseção), para as quinas fecharem sem sobras.
 */
function wallRuns(edge: Vec3[], others: Cut[]): Float32Array[] {
  const isHidden = (point: Vec3) => others.some((other) => other.contains(point));
  const between = (from: Vec3, to: Vec3, amount: number) => normalize(add(scale(from, 1 - amount), scale(to, amount)));
  const runs: Vec3[][] = [];
  let run: Vec3[] | null = null;
  let wasHidden = false;

  edge.forEach((point, index) => {
    const hidden = isHidden(point);

    if (index > 0 && hidden !== wasHidden) {
      let low = 0;
      let high = 1;

      for (let step = 0; step < 20; step++) {
        const middle = (low + high) / 2;

        if (isHidden(between(edge[index - 1], point, middle)) === wasHidden) low = middle;
        else high = middle;
      }

      const boundary = between(edge[index - 1], point, (low + high) / 2);

      if (wasHidden) {
        run = [boundary];
      } else if (run) {
        run.push(boundary);
        runs.push(run);
        run = null;
      }
    }

    if (!hidden) {
      run ??= [];
      run.push(point);
    }

    wasHidden = hidden;
  });

  if (run) runs.push(run);

  return runs.map((points) => Float32Array.from(points.flat()));
}

/** Órbita pronta para desenhar: os pontos do círculo e a base do plano dela, para posicionar quem circula */
interface Orbit {
  points: Float32Array;
  radius: number;
  u: Vec3;
  v: Vec3;
  travelers: readonly (readonly [number, number])[];
}

interface Model {
  /** Traços do logo */
  bands: Strip[];
  /** Anéis dos nós */
  rings: Strip[];
  orbits: Orbit[];
}

/** Quanto os nós intermediários ficam para trás da borda do logo, em radianos */
const BEHIND_EDGE = 0.45;

/** Nó logo atrás da borda do logo, na direção informada (graus, sentido anti-horário a partir da direita) */
function behindEdge(degrees: number): Vec3 {
  const angle = (degrees * Math.PI) / 180;

  return [Math.cos(angle) * Math.cos(BEHIND_EDGE), Math.sin(angle) * Math.cos(BEHIND_EDGE), -Math.sin(BEHIND_EDGE)];
}

function buildModel(): Model {
  const nodes = {
    // Os três nós do logo, medidos sobre public/logo.png com o disco normalizado para raio 1
    top: onFront(-0.03, 0.51),
    left: onFront(-0.59, 0.06),
    bottom: onFront(0.16, -0.31),
    // Onde os traços que saem pela borda do logo vão dar: cada par de traços vizinhos chega num nó
    east: behindEdge(-22),
    northEast: behindEdge(45),
    northWest: behindEdge(148),
    southWest: behindEdge(220),
    // Fecha a rede no lado oposto ao logo
    back: [0, 0, -1] as Vec3,
  };

  // Só um par de traços se cruza (top-east com bottom-northEast), como no logo
  const links: [keyof typeof nodes, keyof typeof nodes][] = [
    ["top", "left"],
    ["left", "bottom"],
    ["top", "northWest"],
    ["top", "northEast"],
    ["top", "east"],
    ["left", "northWest"],
    ["left", "southWest"],
    ["bottom", "northEast"],
    ["bottom", "east"],
    ["bottom", "southWest"],
    ["east", "back"],
    ["northEast", "back"],
    ["northWest", "back"],
    ["southWest", "back"],
  ];

  // Cada traço começa e termina dentro do anel de um nó, para os recortes se emendarem
  const insideRing = (NODE_CORE_ANGLE + NODE_RING_ANGLE) / 2;

  const bands = links.map(([from, to]) => {
    const distance = Math.acos(dot(nodes[from], nodes[to]));

    return bandCut(nodes[from], nodes[to], insideRing, distance - insideRing, Math.ceil(distance / 0.015));
  });
  const rings = Object.values(nodes).map((node) => ringCut(node, 128));
  const all = [...bands, ...rings];

  const pack = (points: Vec3[]) => Float32Array.from(points.flat());
  const toStrip = (cut: Cut): Strip => {
    const others = all.filter((other) => other !== cut);

    return {
      left: pack(cut.left),
      right: pack(cut.right),
      walls: [...wallRuns(cut.left, others), ...wallRuns(cut.right, others)],
    };
  };

  const orbits = ORBITS.map(({ radius, tilt, travelers }): Orbit => {
    const plane = multiply(rotationZ(tilt[0]), rotationX(tilt[1]));
    const u = apply(plane, [1, 0, 0]);
    const v = apply(plane, [0, 0, 1]);
    const circle = Array.from({ length: ORBIT_STEPS + 1 }, (_, index) => {
      const angle = (2 * Math.PI * index) / ORBIT_STEPS;

      return scale(add(scale(u, Math.cos(angle)), scale(v, Math.sin(angle))), radius);
    });

    return { points: pack(circle), radius, u, v, travelers };
  });

  return { bands: bands.map(toStrip), rings: rings.map(toStrip), orbits };
}

/** Ponto de luz pré-desenhado, reaproveitado em todos os pontos de conexão do quadro */
function createGlow(core: Rgb, glow: Rgb): HTMLCanvasElement {
  const size = 96;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;

  const context = sprite.getContext("2d");
  if (!context) return sprite;

  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, rgba(core));
  gradient.addColorStop(0.14, rgba(core, 0.85));
  gradient.addColorStop(0.35, rgba(glow, 0.35));
  gradient.addColorStop(1, rgba(glow, 0));

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return sprite;
}

/** Cores do que fica fora da esfera (órbitas e pontos), que precisam contrastar com o fundo da página */
interface Palette {
  /** No escuro os brilhos somam luz; no claro são tinta sobre o fundo */
  additive: boolean;
  line: Rgb;
  glow: HTMLCanvasElement;
}

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

interface LogoGlobeProps {
  /** Área livre abaixo do conteúdo do hero: a calota da esfera aparece dentro dela */
  stageRef: RefObject<HTMLElement | null>;
  className?: string;
}

export function LogoGlobe({ stageRef, className }: LogoGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    // Segundo canvas, fora da tela, onde a casca é pintada e recortada antes de ir para o canvas visível
    const shell = document.createElement("canvas");
    const shellContext = shell.getContext("2d");
    if (!canvas || !context || !shellContext) return;

    const model = buildModel();
    const darkPalette: Palette = { additive: true, line: BRAND_200, glow: createGlow(WHITE, BRAND_500) };
    const lightPalette: Palette = { additive: false, line: BRAND_600, glow: createGlow(BRAND_600, BRAND_500) };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Centro e raio da esfera dentro do canvas, recalculados a cada redimensionamento
    let centerX = 0;
    /** Centro vertical da esfera em repouso; durante a entrada ela é desenhada um pouco abaixo */
    let restY = 0;
    let radius = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let isVisible = true;
    let startedAt: number | null = null;
    let lastFrameAt: number | null = null;

    // Orientação atual da esfera (pontos do modelo → espaço da tela); o giro automático e o arrasto se acumulam nela
    let orientation: Matrix = multiply(
      rotationAround(SPIN_AXIS, reduceMotion ? 0 : START_ANGLE),
      rotationX(INITIAL_TILT),
    );
    /** 0 enquanto a pessoa segura a esfera; volta a 1 aos poucos depois de soltar */
    let spinEase = 1;
    let isDragging = false;
    let lastPointer = { x: 0, y: 0, at: 0 };
    /** Impulso do arrasto, em radianos por segundo, que continua um pouco depois de soltar */
    let velocity = { x: 0, y: 0 };

    /** Gira a esfera acompanhando um deslocamento do ponteiro, em radianos */
    const rotateBy = (x: number, y: number) => {
      orientation = orthonormalize(multiply(multiply(rotationY(x), rotationX(y)), orientation));
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const stage = stageRef.current?.getBoundingClientRect();
      // Sem a área de referência, a calota ocupa os 40% de baixo do canvas
      const stageTop = stage ? stage.top - bounds.top : bounds.height * 0.6;
      const stageHeight = stage ? stage.height : bounds.height * 0.4;

      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2, MAX_BACKING_SIZE / Math.max(width, height, 1));

      // Em telas largas a esfera ocupa quase toda a largura; nas estreitas ela passa das laterais, para a calota não ficar pequena
      radius = Math.max(width * 0.42, Math.min(width * 0.75, 320));
      centerX = width / 2;
      restY = stageTop + stageHeight * 0.08 + radius * SILHOUETTE_RATIO;

      for (const target of [canvas, shell]) {
        target.width = Math.round(width * pixelRatio);
        target.height = Math.round(height * pixelRatio);
      }
    };

    const draw = (now: number) => {
      if (width === 0 || height === 0) return;

      startedAt ??= now;
      const elapsed = (now - startedAt) / 1000;

      const delta = Math.min(0.05, (now - (lastFrameAt ?? now)) / 1000);
      lastFrameAt = now;

      // Sem animação: logo de frente, já completo, e a esfera só se mexe quando arrastada
      const intro = reduceMotion ? 1 : easeOutCubic(Math.min(1, elapsed / INTRO_SECONDS));
      const centerY = restY + (1 - intro) * radius * INTRO_RISE;

      if (!reduceMotion && !isDragging) {
        const friction = Math.exp(-DRAG_FRICTION * delta);

        spinEase = Math.min(1, spinEase + delta / SPIN_RESUME_SECONDS);
        rotateBy(velocity.x * delta, velocity.y * delta);
        velocity = { x: velocity.x * friction, y: velocity.y * friction };
        // Na entrada a esfera chega girando rápido e desacelera até a velocidade normal
        const boost = 1 + INTRO_SPIN_BOOST * (1 - intro) ** 2;
        const spin = ((2 * Math.PI * delta) / TURN_SECONDS) * spinEase * boost;

        orientation = multiply(rotationAround(SPIN_AXIS, spin), orientation);
      }

      const matrix = orientation;

      // Contorno aparente da esfera vista em perspectiva, e a profundidade a partir da qual um ponto fica atrás dele
      const silhouette = radius * SILHOUETTE_RATIO;
      const horizon = 1 / CAMERA_DISTANCE;
      const palette = document.documentElement.classList.contains("light-mode") ? lightPalette : darkPalette;

      /** Projeta um ponto do modelo para a tela: devolve [x, y, profundidade] */
      const projectPoint = (x: number, y: number, z: number): Vec3 => {
        const depth = matrix[6] * x + matrix[7] * y + matrix[8] * z;
        const perspective = CAMERA_DISTANCE / (CAMERA_DISTANCE - depth);

        return [
          centerX + radius * perspective * (matrix[0] * x + matrix[1] * y + matrix[2] * z),
          centerY - radius * perspective * (matrix[3] * x + matrix[4] * y + matrix[5] * z),
          depth,
        ];
      };

      /** Projeta o ponto `index` de uma sequência de pontos; `shellScale` leva o ponto para outra altura da casca */
      const project = (points: Float32Array, index: number, shellScale = 1): Vec3 =>
        projectPoint(points[index * 3] * shellScale, points[index * 3 + 1] * shellScale, points[index * 3 + 2] * shellScale);

      /** Acrescenta o quadrilátero ao caminho sempre no mesmo sentido: com sentidos opostos, a sobreposição de dois deles ficaria vazia */
      const addQuad = (path: Path2D, a: Vec3, b: Vec3, c: Vec3, d: Vec3) => {
        const area = (c[0] - a[0]) * (d[1] - b[1]) - (d[0] - b[0]) * (c[1] - a[1]);
        const [second, fourth] = area > 0 ? [b, d] : [d, b];

        path.moveTo(a[0], a[1]);
        path.lineTo(second[0], second[1]);
        path.lineTo(c[0], c[1]);
        path.lineTo(fourth[0], fourth[1]);
        path.closePath();
      };

      // A parede começa um pixel para fora da borda do recorte, embaixo da casca, para não sobrar um fio escuro entre as duas
      const wallStart = 1 + 1 / radius;

      /** Leva o ponto para fora do contorno da esfera, na mesma direção em que ele está a partir do centro */
      const outsideLimb = (point: Vec3): Vec3 => {
        const x = point[0] - centerX;
        const y = point[1] - centerY;
        const reach = (silhouette * 1.03) / Math.max(1, Math.hypot(x, y));

        return [centerX + x * reach, centerY + y * reach, point[2]];
      };

      // Um pedaço de recorte que cruza o horizonte tem cantos dos dois lados. Em cada face (frente e trás) os
      // cantos que pertencem à outra vão para fora do contorno; sem isso o recorte pararia um trecho antes
      // dele e sobraria um fio atravessando o vão
      const frontCorner = (point: Vec3) => (point[2] >= horizon ? point : outsideLimb(point));
      const backCorner = (point: Vec3) => (point[2] < horizon ? point : outsideLimb(point));

      /**
       * Até que profundidade atrás do horizonte os recortes ainda são desenhados. Onde um recorte passa para o
       * lado de lá, o que aparece dele fica no aro do contorno: a parede do outro lado e o vão aberto no perfil.
       */
      const backReach = horizon - 0.5;

      const cuts = new Path2D();
      const walls = new Path2D();
      const backCuts = new Path2D();
      const backWalls = new Path2D();

      /** Parede entre dois pontos vizinhos de uma borda: desce da face de fora até a de dentro (a espessura da casca) */
      const addWall = (path: Path2D, points: Float32Array, from: number, to: number) => {
        addQuad(
          path,
          project(points, from, wallStart),
          project(points, to, wallStart),
          project(points, to, INNER_SHELL_SCALE),
          project(points, from, INNER_SHELL_SCALE),
        );
      };

      /** Recorta a faixa na casca e levanta as paredes do recorte, separando o que está na frente do que passou do horizonte */
      const cut = (strip: Strip) => {
        let previousLeft: Vec3 | null = null;
        let previousRight: Vec3 | null = null;

        for (let index = 0; index < strip.left.length / 3; index++) {
          const left = project(strip.left, index);
          const right = project(strip.right, index);

          if (previousLeft && previousRight) {
            const frontmost = Math.max(left[2], right[2], previousLeft[2], previousRight[2]);
            const backmost = Math.min(left[2], right[2], previousLeft[2], previousRight[2]);

            if (frontmost > horizon) {
              addQuad(cuts, frontCorner(previousLeft), frontCorner(left), frontCorner(right), frontCorner(previousRight));
            }
            if (backmost < horizon && frontmost > backReach) {
              addQuad(backCuts, backCorner(previousLeft), backCorner(left), backCorner(right), backCorner(previousRight));
            }
          }

          previousLeft = left;
          previousRight = right;
        }

        for (const run of strip.walls) {
          let previousDepth = 0;

          for (let index = 0; index < run.length / 3; index++) {
            const depth = project(run, index)[2];
            const frontmost = Math.max(depth, previousDepth);

            if (index > 0 && frontmost > backReach) addWall(frontmost > horizon ? walls : backWalls, run, index - 1, index);
            previousDepth = depth;
          }
        }
      };

      for (const strip of model.rings) cut(strip);
      for (const strip of model.bands) cut(strip);

      const sphere = new Path2D();
      sphere.arc(centerX, centerY, silhouette, 0, 2 * Math.PI);

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      // Interior da casca, visto pelos recortes: escuro, um pouco mais claro onde a luz que entra pela frente bate
      const inside = context.createRadialGradient(
        centerX + silhouette * 0.3,
        centerY + silhouette * 0.3,
        0,
        centerX,
        centerY,
        silhouette,
      );
      inside.addColorStop(0, rgba(BRAND_950));
      inside.addColorStop(1, rgba(INTERIOR_SHADOW));
      context.fillStyle = inside;
      context.fill(sphere);

      // Aro do contorno: a faixa entre a face de dentro e a de fora da casca, vista de lado.
      // Quem olha por ela passa só pela espessura da casca, sem entrar no interior oco
      const innerSilhouette =
        (radius * INNER_SHELL_SCALE * CAMERA_DISTANCE) / Math.sqrt(CAMERA_DISTANCE ** 2 - INNER_SHELL_SCALE ** 2);
      const limbBand = new Path2D();
      limbBand.arc(centerX, centerY, silhouette + 1, 0, 2 * Math.PI);
      limbBand.moveTo(centerX + innerSilhouette, centerY);
      limbBand.arc(centerX, centerY, innerSilhouette, 0, 2 * Math.PI);

      // Onde o recorte continua do outro lado do horizonte, o perfil da esfera fica aberto: dá para ver através
      context.save();
      context.clip(limbBand, "evenodd");
      context.globalCompositeOperation = "destination-out";
      context.fill(backCuts);
      context.restore();

      // Paredes dos recortes; a casca desenhada depois cobre as que ficam escondidas.
      // As de trás do horizonte só aparecem no aro do contorno
      const wallShade = context.createLinearGradient(
        centerX - silhouette,
        centerY - silhouette,
        centerX + silhouette,
        centerY + silhouette,
      );
      wallShade.addColorStop(0, rgba(BRAND_800));
      wallShade.addColorStop(1, rgba(BRAND_900));
      context.fillStyle = wallShade;
      context.save();
      context.clip(sphere);
      context.fill(walls);
      context.restore();
      context.save();
      context.clip(limbBand, "evenodd");
      context.fill(backWalls);
      context.restore();

      // Casca, com a luz vindo de cima e da esquerda e a sombra do lado oposto
      shellContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      shellContext.globalCompositeOperation = "source-over";
      shellContext.clearRect(0, 0, width, height);
      const lit = shellContext.createRadialGradient(
        centerX - silhouette * 0.45,
        centerY - silhouette * 0.5,
        0,
        centerX - silhouette * 0.2,
        centerY - silhouette * 0.2,
        silhouette * 1.5,
      );
      lit.addColorStop(0, rgba(BRAND_300));
      lit.addColorStop(0.18, rgba(BRAND_400));
      lit.addColorStop(0.45, rgba(BRAND_600));
      lit.addColorStop(0.75, rgba(BRAND_700));
      lit.addColorStop(1, rgba(BRAND_900));
      shellContext.fillStyle = lit;
      shellContext.fill(sphere);

      // Fio de luz no contorno, do lado iluminado (só a metade de dentro do traço fica na esfera)
      const rim = shellContext.createLinearGradient(centerX - silhouette, 0, centerX + silhouette * 0.2, 0);
      rim.addColorStop(0, rgba(WHITE, 0.75));
      rim.addColorStop(1, rgba(WHITE, 0));
      shellContext.save();
      shellContext.clip(sphere);
      shellContext.strokeStyle = rim;
      shellContext.lineWidth = Math.max(3, radius * 0.016);
      shellContext.stroke(sphere);
      shellContext.restore();

      // Os recortes saem da casca já pintada; fora da tela, para não apagar o interior e as paredes
      shellContext.globalCompositeOperation = "destination-out";
      shellContext.fill(cuts);

      context.drawImage(shell, 0, 0, width, height);

      // Halo atrás da esfera, por último e por baixo de tudo, para aparecer também nos vãos abertos no contorno
      const halo = context.createRadialGradient(centerX, centerY, silhouette * 0.9, centerX, centerY, silhouette * 1.45);
      halo.addColorStop(0, rgba(BRAND_500, 0.34));
      halo.addColorStop(0.4, rgba(BRAND_500, 0.1));
      halo.addColorStop(1, rgba(BRAND_500, 0));
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = halo;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";

      // Órbitas: some o trecho que passa atrás da esfera; o que passa na frente dela é desenhado em branco,
      // para aparecer sobre o roxo, e o resto na cor que contrasta com o fundo da página
      const isBehindSphere = (point: Vec3) =>
        point[2] < horizon && Math.hypot(point[0] - centerX, point[1] - centerY) < silhouette;
      const isOverSphere = (point: Vec3) =>
        point[2] >= horizon && Math.hypot(point[0] - centerX, point[1] - centerY) < silhouette;

      // Mais perto de quem olha, mais forte. A variação é contínua ao longo da órbita: com faixas fixas de
      // opacidade a linha mudava de brilho de repente ao girar e parecia acabar no meio do caminho
      const depthAlpha = (depth: number) => 0.14 + 0.42 * Math.min(1, Math.max(0, (depth + 1.25) / 2.5));

      context.lineWidth = 1.25;

      for (const orbit of model.orbits) {
        const outside = new Path2D();
        const over = new Path2D();
        const count = Math.ceil((ORBIT_STEPS + 1) * intro);
        let previous: Vec3 | null = null;
        let current: Path2D | null = null;

        for (let index = 0; index < count; index++) {
          const point = project(orbit.points, index);
          const target =
            !previous || isBehindSphere(point) || isBehindSphere(previous)
              ? null
              : isOverSphere(point) && isOverSphere(previous)
                ? over
                : outside;

          if (target && previous) {
            if (target !== current) target.moveTo(previous[0], previous[1]);
            target.lineTo(point[0], point[1]);
          }

          current = target;
          previous = point;
        }

        // A profundidade muda de forma linear ao longo do plano da órbita, então um degradê entre o ponto
        // mais distante e o mais próximo dela dá a opacidade certa para a linha inteira
        const toViewer: Vec3 = [matrix[6], matrix[7], matrix[8]];
        const normal = cross(orbit.u, orbit.v);
        const inPlane = add(toViewer, scale(normal, -dot(toViewer, normal)));
        const slope = Math.hypot(inPlane[0], inPlane[1], inPlane[2]);
        const nearest = scale(inPlane, orbit.radius / Math.max(slope, 1e-6));
        const near = projectPoint(nearest[0], nearest[1], nearest[2]);
        const far = projectPoint(-nearest[0], -nearest[1], -nearest[2]);
        // Órbita vista de frente: toda ela na mesma profundidade, sem degradê
        const isFlat = slope < 1e-3 || Math.hypot(near[0] - far[0], near[1] - far[1]) < 1;

        const strokeByDepth = (path: Path2D, color: Rgb) => {
          if (isFlat) {
            context.strokeStyle = rgba(color, depthAlpha(0));
          } else {
            const fade = context.createLinearGradient(far[0], far[1], near[0], near[1]);
            fade.addColorStop(0, rgba(color, depthAlpha(-orbit.radius * slope)));
            fade.addColorStop(1, rgba(color, depthAlpha(orbit.radius * slope)));
            context.strokeStyle = fade;
          }

          context.stroke(path);
        };

        strokeByDepth(outside, palette.line);
        strokeByDepth(over, WHITE);
      }

      // Pontos de conexão circulando nas órbitas
      const dotRadius = Math.max(2, radius * 0.007);

      for (const orbit of model.orbits) {
        for (const [phase, speed] of orbit.travelers) {
          const angle = phase + speed * (reduceMotion ? 0 : elapsed);
          const cos = Math.cos(angle) * orbit.radius;
          const sin = Math.sin(angle) * orbit.radius;
          const point = projectPoint(
            orbit.u[0] * cos + orbit.v[0] * sin,
            orbit.u[1] * cos + orbit.v[1] * sin,
            orbit.u[2] * cos + orbit.v[2] * sin,
          );
          if (isBehindSphere(point)) continue;

          // Mais perto de quem olha, maior e mais forte
          const nearness = 0.55 + 0.45 * Math.min(1, Math.max(0, (point[2] + 1.3) / 2.6));
          const over = isOverSphere(point);
          const glowSize = radius * 0.1 * nearness;

          context.globalAlpha = intro * nearness;
          context.globalCompositeOperation = palette.additive || over ? "lighter" : "source-over";
          context.drawImage(
            over ? darkPalette.glow : palette.glow,
            point[0] - glowSize / 2,
            point[1] - glowSize / 2,
            glowSize,
            glowSize,
          );
          context.globalCompositeOperation = "source-over";
          context.fillStyle = rgba(over ? WHITE : palette.line);
          context.beginPath();
          context.arc(point[0], point[1], dotRadius * nearness, 0, 2 * Math.PI);
          context.fill();
        }
      }

      context.globalAlpha = 1;

      // Entrada: tudo o que foi desenhado aparece junto, em vez de cada camada com a sua transparência
      if (intro < 1) {
        context.globalCompositeOperation = "destination-in";
        context.fillStyle = rgba(WHITE, Math.min(1, intro * 1.6));
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = "source-over";
      }
    };

    const tick = (now: number) => {
      draw(now);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (reduceMotion) draw(performance.now());
      else if (isVisible) frame = requestAnimationFrame(tick);
    };

    /** Posição do ponteiro e se ele está sobre a esfera */
    const locate = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left - centerX;
      const y = event.clientY - bounds.top - restY;

      return { x: event.clientX, y: event.clientY, isOverSphere: Math.hypot(x, y) <= radius * SILHOUETTE_RATIO };
    };

    const onPointerDown = (event: PointerEvent) => {
      const pointer = locate(event);
      if (!pointer.isOverSphere) return;

      isDragging = true;
      spinEase = 0;
      velocity = { x: 0, y: 0 };
      lastPointer = { x: pointer.x, y: pointer.y, at: event.timeStamp };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
      // Evita selecionar o texto da página enquanto arrasta
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      const pointer = locate(event);

      if (!isDragging) {
        canvas.style.cursor = pointer.isOverSphere ? "grab" : "";
        return;
      }

      // O ponto da esfera sob o ponteiro acompanha o movimento dele
      const x = (pointer.x - lastPointer.x) / radius;
      const y = (pointer.y - lastPointer.y) / radius;
      const seconds = Math.max(0.001, (event.timeStamp - lastPointer.at) / 1000);

      rotateBy(x, y);
      velocity = { x: 0.5 * velocity.x + (0.5 * x) / seconds, y: 0.5 * velocity.y + (0.5 * y) / seconds };
      lastPointer = { x: pointer.x, y: pointer.y, at: event.timeStamp };

      if (reduceMotion) draw(performance.now());
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!isDragging) return;

      isDragging = false;
      canvas.style.cursor = locate(event).isOverSphere ? "grab" : "";
      // Soltou com o ponteiro parado: sem impulso
      if (event.timeStamp - lastPointer.at > 80) velocity = { x: 0, y: 0 };
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      // Redimensionar limpa o canvas: redesenha na hora para não piscar
      draw(performance.now());
    });
    resizeObserver.observe(canvas);
    if (stageRef.current) resizeObserver.observe(stageRef.current);

    // As cores de fora da esfera dependem do tema; sem animação, é preciso redesenhar quando ele muda
    const themeObserver = new MutationObserver(() => {
      if (reduceMotion) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Fora da tela a esfera para de animar
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      start();
    });
    visibilityObserver.observe(canvas);

    resize();
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [stageRef]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Logo da LAWD em 3D: uma esfera roxa com três nós ligados por traços vazados, cercada por órbitas com pontos de conexão"
      // touch-pan-y: no celular, arrastar na vertical continua rolando a página; na horizontal gira a esfera
      className={cx("block touch-pan-y select-none", className)}
    />
  );
}
