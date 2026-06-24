import { Activity, Gauge, Move, Zap } from 'lucide-react';
import type { Ball, SimulationStats } from '../types';
import { magnitude } from '../physics/engine';

interface DashboardProps {
  stats: SimulationStats;
  energyHistory: number[];
  selectedBall: Ball | null;
}

/**
 * リアルタイム統計ダッシュボード（オブザーバビリティ）。
 * FPS・総エネルギー推移（SVG スパークライン）・選択ボールの速度ベクトルを可視化する。
 */
export function Dashboard({
  stats,
  energyHistory,
  selectedBall,
}: DashboardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-surface-border bg-surface-raised/60 p-4">
      <header className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Live Telemetry
        </h2>
      </header>

      {/* 主要メトリクス */}
      <div className="grid grid-cols-3 gap-2">
        <Metric
          icon={Gauge}
          label="FPS"
          value={stats.fps.toString()}
          tone={fpsTone(stats.fps)}
        />
        <Metric
          icon={Zap}
          label="Energy"
          value={formatEnergy(stats.totalEnergy)}
        />
        <Metric icon={Move} label="Balls" value={stats.ballCount.toString()} />
      </div>

      {/* エネルギー推移グラフ */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Total Energy (PE + KE)</span>
          <span className="font-mono">
            KE {formatEnergy(stats.kineticEnergy)} · PE{' '}
            {formatEnergy(stats.potentialEnergy)}
          </span>
        </div>
        <EnergySparkline history={energyHistory} />
      </div>

      {/* 選択ボールの速度ベクトル */}
      <SelectedBallPanel ball={selectedBall} />
    </div>
  );
}

interface MetricProps {
  icon: typeof Gauge;
  label: string;
  value: string;
  tone?: string;
}

function Metric({ icon: Icon, label, value, tone }: MetricProps) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface/60 p-2.5">
      <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div
        className={`font-mono text-lg font-semibold tabular-nums ${
          tone ?? 'text-slate-100'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/** FPS の良し悪しで色を変える。 */
function fpsTone(fps: number): string {
  if (fps >= 50) return 'text-emerald-400';
  if (fps >= 30) return 'text-amber-400';
  return 'text-rose-400';
}

/** エネルギー値を読みやすい桁数に整形する。 */
function formatEnergy(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(0);
}

/** SVG によるエネルギー推移スパークライン。 */
function EnergySparkline({ history }: { history: number[] }) {
  const width = 100;
  const height = 36;

  if (history.length < 2) {
    return (
      <div className="flex h-9 items-center justify-center rounded-lg border border-surface-border bg-surface/40 text-[10px] text-slate-600">
        collecting…
      </div>
    );
  }

  const max = Math.max(...history, 1);
  const min = Math.min(...history, 0);
  const range = max - min || 1;
  const stepX = width / (history.length - 1);

  const points = history
    .map((value, i) => {
      const x = i * stepX;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-9 w-full rounded-lg border border-surface-border bg-surface/40"
    >
      <polyline points={areaPoints} fill="rgba(91, 140, 255, 0.15)" />
      <polyline
        points={points}
        fill="none"
        stroke="#5b8cff"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** 選択中ボールの詳細（速度ベクトルの数値とミニ可視化）。 */
function SelectedBallPanel({ ball }: { ball: Ball | null }) {
  if (!ball) {
    return (
      <div className="rounded-lg border border-dashed border-surface-border bg-surface/40 p-3 text-center text-xs text-slate-600">
        Canvas 上のボールをクリックして速度ベクトルを観測
      </div>
    );
  }

  const speed = magnitude(ball.velocity);
  // ミニ可視化用に速度ベクトルを正規化する。
  const cx = 22;
  const cy = 22;
  const scale = speed > 0 ? Math.min(16, speed * 1.5) / Math.max(speed, 0.001) : 0;
  const ex = cx + ball.velocity.x * scale;
  const ey = cy + ball.velocity.y * scale;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface/60 p-3">
      <svg viewBox="0 0 44 44" className="h-11 w-11 shrink-0">
        <circle cx={cx} cy={cy} r="20" fill="rgba(255,255,255,0.04)" />
        <circle cx={cx} cy={cy} r="2.5" fill={ball.color} />
        <line
          x1={cx}
          y1={cy}
          x2={ex}
          y2={ey}
          stroke="#ffd43b"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: ball.color }}
          />
          <span className="text-xs font-medium text-slate-300">
            Ball #{ball.id}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px] text-slate-400">
          <Stat label="vx" value={ball.velocity.x.toFixed(2)} />
          <Stat label="vy" value={ball.velocity.y.toFixed(2)} />
          <Stat label="|v|" value={speed.toFixed(2)} />
          <Stat label="m" value={ball.mass.toFixed(1)} />
        </dl>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-600">{label}</span>
      <span className="tabular-nums text-slate-200">{value}</span>
    </div>
  );
}
