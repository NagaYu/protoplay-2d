import { Globe, Moon, Rocket, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PresetId } from '../types';
import { PRESET_LIST } from '../physics/presets';

interface PresetButtonsProps {
  activePreset: PresetId | null;
  onApply: (id: PresetId) => void;
}

/** プリセットごとのアイコン対応。 */
const PRESET_ICONS: Record<PresetId, LucideIcon> = {
  earth: Globe,
  moon: Moon,
  space: Rocket,
  superbounce: Sparkles,
};

/**
 * 環境プリセット切り替えボタン群。
 * Earth / Moon / Space / Super Bounce を一発で適用する。
 */
export function PresetButtons({ activePreset, onApply }: PresetButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PRESET_LIST.map((preset) => {
        const Icon = PRESET_ICONS[preset.id];
        const active = preset.id === activePreset;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApply(preset.id)}
            title={preset.description}
            className={`group flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all ${
              active
                ? 'border-accent bg-accent/15 shadow-glow'
                : 'border-surface-border bg-surface/60 hover:border-accent/50 hover:bg-surface-raised'
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                active ? 'text-accent-soft' : 'text-slate-400 group-hover:text-accent-soft'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                active ? 'text-slate-50' : 'text-slate-300'
              }`}
            >
              {preset.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
