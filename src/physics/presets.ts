import type { Preset, PresetId } from '../types';

/**
 * 環境プリセット定義。
 * UI から一発で重力・反発・抵抗を切り替えるための値の組み合わせ。
 */
export const PRESETS: Record<PresetId, Preset> = {
  earth: {
    id: 'earth',
    label: 'Earth',
    description: '標準的な地球環境。程よい重力と空気抵抗。',
    environment: { gravity: 9.8, restitution: 0.7, airResistance: 0.005 },
  },
  moon: {
    id: 'moon',
    label: 'Moon',
    description: '月面。地球の約 1/6 の低重力でふわりと跳ねる。',
    environment: { gravity: 1.6, restitution: 0.8, airResistance: 0.0 },
  },
  space: {
    id: 'space',
    label: 'Space',
    description: '無重力の宇宙空間。ボールは慣性のまま漂い続ける。',
    environment: { gravity: 0, restitution: 1.0, airResistance: 0.0 },
  },
  superbounce: {
    id: 'superbounce',
    label: 'Super Bounce',
    description: '超高反発ゴムの世界。エネルギーをほぼ失わず弾み続ける。',
    environment: { gravity: 18, restitution: 0.99, airResistance: 0.0 },
  },
};

/** 表示順を固定した配列。 */
export const PRESET_LIST: Preset[] = [
  PRESETS.earth,
  PRESETS.moon,
  PRESETS.space,
  PRESETS.superbounce,
];

/** デフォルトの起動プリセット。 */
export const DEFAULT_PRESET_ID: PresetId = 'earth';
