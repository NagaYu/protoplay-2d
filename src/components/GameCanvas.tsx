import { useEffect, useRef } from 'react';
import type { Ball } from '../types';
import type { Bounds } from '../physics/engine';
import { magnitude } from '../physics/engine';

interface GameCanvasProps {
  ballsRef: React.MutableRefObject<Ball[]>;
  selectedBallId: number | null;
  debugMode: boolean;
  onSelectBall: (id: number | null) => void;
  onResize: (bounds: Bounds) => void;
  /** 描画ループから 1 フレーム進めるコールバック。dt を引数に取る。 */
  onTick: (dt: number) => void;
}

/** 速度ベクトルを描く際の矢印の縮尺。 */
const VELOCITY_ARROW_SCALE = 6;

/**
 * Canvas 描画コンポーネント（左カラム）。
 * 物理計算は onTick 経由でフックに委譲し、本コンポーネントは
 * requestAnimationFrame ループと描画・当たり判定（クリック選択）のみを担う。
 */
export function GameCanvas({
  ballsRef,
  selectedBallId,
  debugMode,
  onSelectBall,
  onResize,
  onTick,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 最新の props をループ内から参照するための ref。
  const selectedRef = useRef(selectedBallId);
  selectedRef.current = selectedBallId;
  const debugRef = useRef(debugMode);
  debugRef.current = debugMode;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  // --- リサイズ監視（高 DPI 対応） ---
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const applySize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      onResize({ width: rect.width, height: rect.height });
    };

    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [onResize]);

  // --- メイン描画ループ ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      const deltaMs = time - lastTime;
      lastTime = time;
      // 60fps を 1.0 とした dt スケール。
      const dt = deltaMs / (1000 / 60);

      onTickRef.current(dt > 0 ? dt : 1);

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      drawScene(
        ctx,
        ballsRef.current,
        width,
        height,
        selectedRef.current,
        debugRef.current,
      );

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [ballsRef]);

  // --- クリックでボール選択 ---
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 手前（後に描かれた＝配列後方）のボールを優先して判定する。
    const balls = ballsRef.current;
    for (let i = balls.length - 1; i >= 0; i--) {
      const ball = balls[i];
      const dx = ball.position.x - x;
      const dy = ball.position.y - y;
      if (dx * dx + dy * dy <= ball.radius * ball.radius) {
        onSelectBall(ball.id === selectedRef.current ? null : ball.id);
        return;
      }
    }
    onSelectBall(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-xl border border-surface-border bg-[#070a12]"
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="block h-full w-full cursor-crosshair"
      />
    </div>
  );
}

/** シーン全体を描画する。 */
function drawScene(
  ctx: CanvasRenderingContext2D,
  balls: Ball[],
  width: number,
  height: number,
  selectedId: number | null,
  debug: boolean,
): void {
  // 背景
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height);
  drawGround(ctx, width, height);

  // ボール
  for (const ball of balls) {
    drawBall(ctx, ball, ball.id === selectedId, debug);
  }
}

/** 薄いグリッド背景。 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(91, 140, 255, 0.06)';
  ctx.lineWidth = 1;
  const gap = 40;
  for (let x = 0; x <= width; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** 地面のハイライト。 */
function drawGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.save();
  const gradient = ctx.createLinearGradient(0, height - 24, 0, height);
  gradient.addColorStop(0, 'rgba(91, 140, 255, 0)');
  gradient.addColorStop(1, 'rgba(91, 140, 255, 0.12)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height - 24, width, 24);
  ctx.restore();
}

/** ボール 1 個を描画する。選択中はリングと速度ベクトルを描く。 */
function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  selected: boolean,
  debug: boolean,
): void {
  const { x, y } = ball.position;

  // 本体（放射状グラデーションで立体感）。
  ctx.save();
  const gradient = ctx.createRadialGradient(
    x - ball.radius * 0.3,
    y - ball.radius * 0.3,
    ball.radius * 0.1,
    x,
    y,
    ball.radius,
  );
  gradient.addColorStop(0, lighten(ball.color));
  gradient.addColorStop(1, ball.color);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 選択リング
  if (selected) {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, ball.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 速度ベクトル（選択中 or デバッグモード）
  if ((selected || debug) && magnitude(ball.velocity) > 0.2) {
    drawVelocityVector(ctx, ball);
  }
}

/** 速度ベクトルを矢印で描画する。 */
function drawVelocityVector(ctx: CanvasRenderingContext2D, ball: Ball): void {
  const { x, y } = ball.position;
  const ex = x + ball.velocity.x * VELOCITY_ARROW_SCALE;
  const ey = y + ball.velocity.y * VELOCITY_ARROW_SCALE;

  ctx.save();
  ctx.strokeStyle = '#ffd43b';
  ctx.fillStyle = '#ffd43b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // 矢じり
  const angle = Math.atan2(ey - y, ex - x);
  const head = 7;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(
    ex - head * Math.cos(angle - Math.PI / 6),
    ey - head * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    ex - head * Math.cos(angle + Math.PI / 6),
    ey - head * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 色を少し明るくする（簡易ハイライト用）。 */
function lighten(color: string): string {
  // #rrggbb 前提で各チャンネルを持ち上げる。
  if (!color.startsWith('#') || color.length !== 7) return color;
  const r = Math.min(255, parseInt(color.slice(1, 3), 16) + 60);
  const g = Math.min(255, parseInt(color.slice(3, 5), 16) + 60);
  const b = Math.min(255, parseInt(color.slice(5, 7), 16) + 60);
  return `rgb(${r}, ${g}, ${b})`;
}
