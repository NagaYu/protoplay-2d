import { Pause, Play, Plus, RotateCcw, Bug } from 'lucide-react';

interface ToolbarProps {
  paused: boolean;
  debugMode: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onAddBall: () => void;
  onToggleDebug: () => void;
}

/**
 * シミュレーション操作バー。
 * Pause / Reset / Add Ball とデバッグモード切り替えを提供する。
 */
export function Toolbar({
  paused,
  debugMode,
  onTogglePause,
  onReset,
  onAddBall,
  onToggleDebug,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onTogglePause}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-glow transition-colors hover:bg-accent-soft"
      >
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        {paused ? 'Resume' : 'Pause'}
      </button>

      <button
        type="button"
        onClick={onAddBall}
        className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-accent/50 hover:text-white"
      >
        <Plus className="h-4 w-4" />
        Add Ball
      </button>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-accent/50 hover:text-white"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </button>

      <button
        type="button"
        onClick={onToggleDebug}
        className={`ml-auto inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
          debugMode
            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
            : 'border-surface-border bg-surface-raised text-slate-400 hover:text-white'
        }`}
      >
        <Bug className="h-4 w-4" />
        Debug {debugMode ? 'On' : 'Off'}
      </button>
    </div>
  );
}
