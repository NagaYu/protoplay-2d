/**
 * 共有型定義。
 * 物理エンジン・UI・フックがこのファイルの型を参照する単一の真実とする。
 */

/** 2 次元ベクトル（位置・速度・加速度に共用）。 */
export interface Vec2 {
  x: number;
  y: number;
}

/** シミュレーション内のボール（剛体円）。 */
export interface Ball {
  /** 一意な識別子。 */
  id: number;
  /** 中心座標（px）。 */
  position: Vec2;
  /** 速度（px / frame, dt 正規化済み）。 */
  velocity: Vec2;
  /** 半径（px）。 */
  radius: number;
  /** 質量（衝突の運動量計算に使用）。 */
  mass: number;
  /** 描画カラー（CSS 色文字列）。 */
  color: string;
}

/** 環境パラメータ。スライダー・プリセットから更新される。 */
export interface Environment {
  /** 重力加速度（px / frame^2 相当, 0〜30）。 */
  gravity: number;
  /** 反発係数 / restitution（0.0〜1.0）。 */
  restitution: number;
  /** 空気抵抗係数（0.0〜0.1）。毎フレーム速度に乗算減衰する。 */
  airResistance: number;
}

/** 新規ボール生成時のデフォルト設定。 */
export interface SpawnConfig {
  /** 生成するボールの半径（px）。 */
  radius: number;
  /** 生成するボールの質量。 */
  mass: number;
}

/** 環境プリセットの識別子。 */
export type PresetId = 'earth' | 'moon' | 'space' | 'superbounce';

/** プリセット定義。 */
export interface Preset {
  id: PresetId;
  label: string;
  description: string;
  environment: Environment;
}

/** 統計ダッシュボード用のサンプリング値。 */
export interface SimulationStats {
  /** 直近フレームの実測 FPS。 */
  fps: number;
  /** 全ボールの位置エネルギー合計。 */
  potentialEnergy: number;
  /** 全ボールの運動エネルギー合計。 */
  kineticEnergy: number;
  /** 総エネルギー（位置 + 運動）。 */
  totalEnergy: number;
  /** 画面内のボール数。 */
  ballCount: number;
}
