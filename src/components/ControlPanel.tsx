import { ArrowDownWideNarrow, CircleDot, Sliders, Weight, Wind } from 'lucide-react';
import type { Environment, PresetId, SpawnConfig } from '../types';
import { Slider } from './ui/Slider';
import { PresetButtons } from './PresetButtons';

interface ControlPanelProps {
  environment: Environment;
  spawn: SpawnConfig;
  activePreset: PresetId | null;
  onEnvironmentChange: (patch: Partial<Environment>) => void;
  onSpawnChange: (patch: Partial<SpawnConfig>) => void;
  onApplyPreset: (id: PresetId) => void;
}

/**
 * パラメータ操作パネル（右カラム）。
 * 環境プリセット → 物理パラメータ → 新規ボール設定の順で構成する。
 */
export function ControlPanel({
  environment,
  spawn,
  activePreset,
  onEnvironmentChange,
  onSpawnChange,
  onApplyPreset,
}: ControlPanelProps) {
  return (
    <div className="space-y-5">
      {/* 環境プリセット */}
      <section>
        <SectionTitle>Environment Presets</SectionTitle>
        <PresetButtons activePreset={activePreset} onApply={onApplyPreset} />
      </section>

      {/* 物理パラメータ */}
      <section className="space-y-4 rounded-xl border border-surface-border bg-surface-raised/60 p-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Physics
          </h2>
        </div>

        <Slider
          label="Gravity"
          icon={ArrowDownWideNarrow}
          value={environment.gravity}
          min={0}
          max={30}
          step={0.1}
          format={(v) => v.toFixed(1)}
          onChange={(v) => onEnvironmentChange({ gravity: v })}
        />
        <Slider
          label="Bounciness"
          icon={CircleDot}
          value={environment.restitution}
          min={0}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={(v) => onEnvironmentChange({ restitution: v })}
        />
        <Slider
          label="Air Resistance"
          icon={Wind}
          value={environment.airResistance}
          min={0}
          max={0.1}
          step={0.001}
          format={(v) => v.toFixed(3)}
          onChange={(v) => onEnvironmentChange({ airResistance: v })}
        />
      </section>

      {/* 新規ボール設定 */}
      <section className="space-y-4 rounded-xl border border-surface-border bg-surface-raised/60 p-4">
        <div className="flex items-center gap-2">
          <CircleDot className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            New Ball
          </h2>
        </div>

        <Slider
          label="Radius"
          icon={CircleDot}
          value={spawn.radius}
          min={6}
          max={50}
          step={1}
          unit="px"
          format={(v) => v.toFixed(0)}
          onChange={(v) => onSpawnChange({ radius: v })}
        />
        <Slider
          label="Mass"
          icon={Weight}
          value={spawn.mass}
          min={0.5}
          max={10}
          step={0.5}
          format={(v) => v.toFixed(1)}
          onChange={(v) => onSpawnChange({ mass: v })}
        />
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
      {children}
    </h2>
  );
}
