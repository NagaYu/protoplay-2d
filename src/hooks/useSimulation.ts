import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Ball,
  Environment,
  PresetId,
  SimulationStats,
  SpawnConfig,
} from '../types';
import {
  computeStats,
  spawnRandomBall,
  step,
  type Bounds,
} from '../physics/engine';
import { DEFAULT_PRESET_ID, PRESETS } from '../physics/presets';

/** ダッシュボードのエネルギーグラフに残す履歴の長さ。 */
const ENERGY_HISTORY_LENGTH = 120;
/** 初期配置するボールの数。 */
const INITIAL_BALL_COUNT = 6;

/** dt の暴走（タブ非アクティブ復帰など）を防ぐ上限。 */
const MAX_DT = 3;

export interface UseSimulationResult {
  /** 物理状態を保持する ref（描画ループから直接読む）。 */
  ballsRef: React.MutableRefObject<Ball[]>;
  /** 統計値（React state, ダッシュボード更新用）。 */
  stats: SimulationStats;
  /** 総エネルギーの時系列履歴。 */
  energyHistory: number[];
  /** 環境パラメータ。 */
  environment: Environment;
  /** 新規ボールの生成設定。 */
  spawn: SpawnConfig;
  /** 一時停止中か。 */
  paused: boolean;
  /** 現在選択中のプリセット（手動編集時は null）。 */
  activePreset: PresetId | null;
  /** 選択中ボールの ID（null は未選択）。 */
  selectedBallId: number | null;

  setEnvironment: (patch: Partial<Environment>) => void;
  setSpawn: (patch: Partial<SpawnConfig>) => void;
  applyPreset: (id: PresetId) => void;
  togglePause: () => void;
  reset: () => void;
  addBall: () => void;
  selectBall: (id: number | null) => void;
  /** Canvas のサイズを通知する。 */
  setBounds: (bounds: Bounds) => void;
  /** 描画ループから 1 フレーム呼ぶ。dt を返す。 */
  tick: (dt: number) => void;
}

const DEFAULT_SPAWN: SpawnConfig = { radius: 18, mass: 1 };

/**
 * 物理シミュレーション全体の状態とループ制御を司るフック。
 * 物理状態（ballsRef）は再レンダリングを避けるため ref に保持し、
 * UI 表示が必要な統計のみ state として公開する。
 */
export function useSimulation(): UseSimulationResult {
  const ballsRef = useRef<Ball[]>([]);
  const boundsRef = useRef<Bounds>({ width: 800, height: 600 });

  const [environment, setEnvironmentState] = useState<Environment>(
    () => ({ ...PRESETS[DEFAULT_PRESET_ID].environment }),
  );
  const [spawn, setSpawnState] = useState<SpawnConfig>(DEFAULT_SPAWN);
  const [paused, setPaused] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetId | null>(
    DEFAULT_PRESET_ID,
  );
  const [selectedBallId, setSelectedBallId] = useState<number | null>(null);

  const [stats, setStats] = useState<SimulationStats>({
    fps: 0,
    kineticEnergy: 0,
    potentialEnergy: 0,
    totalEnergy: 0,
    ballCount: 0,
  });
  const [energyHistory, setEnergyHistory] = useState<number[]>([]);

  // ループから参照する最新値を ref に同期する。
  const envRef = useRef(environment);
  envRef.current = environment;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // 統計更新の間引き用（毎フレーム setState すると重いため）。
  const statsAccumulator = useRef(0);

  /** 指定数のボールでフィールドを初期化する。 */
  const populate = useCallback((count: number) => {
    const bounds = boundsRef.current;
    const balls: Ball[] = [];
    for (let i = 0; i < count; i++) {
      balls.push(spawnRandomBall(bounds, DEFAULT_SPAWN.radius, DEFAULT_SPAWN.mass));
    }
    ballsRef.current = balls;
  }, []);

  // 初回マウント時に初期ボールを配置する。
  useEffect(() => {
    populate(INITIAL_BALL_COUNT);
  }, [populate]);

  const setEnvironment = useCallback((patch: Partial<Environment>) => {
    setEnvironmentState((prev) => ({ ...prev, ...patch }));
    // 手動でいじったらプリセット選択を解除する。
    setActivePreset(null);
  }, []);

  const setSpawn = useCallback((patch: Partial<SpawnConfig>) => {
    setSpawnState((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyPreset = useCallback((id: PresetId) => {
    setEnvironmentState({ ...PRESETS[id].environment });
    setActivePreset(id);
  }, []);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const reset = useCallback(() => {
    populate(INITIAL_BALL_COUNT);
    setSelectedBallId(null);
    setEnergyHistory([]);
  }, [populate]);

  const addBall = useCallback(() => {
    const ball = spawnRandomBall(
      boundsRef.current,
      spawn.radius,
      spawn.mass,
    );
    ballsRef.current = [...ballsRef.current, ball];
  }, [spawn.radius, spawn.mass]);

  const selectBall = useCallback((id: number | null) => {
    setSelectedBallId(id);
  }, []);

  const setBounds = useCallback((bounds: Bounds) => {
    boundsRef.current = bounds;
  }, []);

  /** 描画ループから 1 フレーム進める。 */
  const tick = useCallback(
    (dt: number) => {
      const clampedDt = Math.min(dt, MAX_DT);
      if (!pausedRef.current) {
        step(ballsRef.current, envRef.current, boundsRef.current, clampedDt);
      }

      // 約 6 フレームに 1 回統計を更新（負荷軽減）。
      statsAccumulator.current += 1;
      if (statsAccumulator.current >= 6) {
        statsAccumulator.current = 0;
        const fps = clampedDt > 0 ? 60 / clampedDt : 0;
        const nextStats = computeStats(
          ballsRef.current,
          envRef.current,
          boundsRef.current,
          Math.round(fps),
        );
        setStats(nextStats);
        setEnergyHistory((prev) => {
          const next = [...prev, nextStats.totalEnergy];
          if (next.length > ENERGY_HISTORY_LENGTH) {
            next.splice(0, next.length - ENERGY_HISTORY_LENGTH);
          }
          return next;
        });
      }
    },
    [],
  );

  return useMemo(
    () => ({
      ballsRef,
      stats,
      energyHistory,
      environment,
      spawn,
      paused,
      activePreset,
      selectedBallId,
      setEnvironment,
      setSpawn,
      applyPreset,
      togglePause,
      reset,
      addBall,
      selectBall,
      setBounds,
      tick,
    }),
    [
      stats,
      energyHistory,
      environment,
      spawn,
      paused,
      activePreset,
      selectedBallId,
      setEnvironment,
      setSpawn,
      applyPreset,
      togglePause,
      reset,
      addBall,
      selectBall,
      setBounds,
      tick,
    ],
  );
}
