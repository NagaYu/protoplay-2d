import type { LucideIcon } from 'lucide-react';

interface SliderProps {
  label: string;
  icon?: LucideIcon;
  value: number;
  min: number;
  max: number;
  step: number;
  /** 値表示のフォーマット（例: 小数桁の制御）。 */
  format?: (value: number) => string;
  /** 単位表記（任意）。 */
  unit?: string;
  onChange: (value: number) => void;
}

/**
 * ダークモード基調の再利用可能なスライダー。
 * UI の見た目のみを担い、ロジックは持たない。
 */
export function Slider({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  format,
  unit,
  onChange,
}: SliderProps) {
  const display = format ? format(value) : value.toString();
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="group">
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          {Icon && <Icon className="h-4 w-4 text-accent-soft" />}
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums text-slate-100">
          {display}
          {unit && <span className="ml-0.5 text-xs text-slate-500">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input"
        style={{
          background: `linear-gradient(to right, #5b8cff ${percent}%, #1f2738 ${percent}%)`,
        }}
        aria-label={label}
      />
    </div>
  );
}
