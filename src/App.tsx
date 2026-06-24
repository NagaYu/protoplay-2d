import { useMemo, useState } from 'react';
import { Github, Boxes } from 'lucide-react';
import { useSimulation } from './hooks/useSimulation';
import { GameCanvas } from './components/GameCanvas';
import { ControlPanel } from './components/ControlPanel';
import { Toolbar } from './components/Toolbar';
import { Dashboard } from './components/Dashboard';

/**
 * アプリ全体の統合。
 * ヘッダー / ツールバー、左カラム（Canvas + Dashboard）、右カラム（ControlPanel）を
 * 2 カラムレイアウトで構成する。
 */
export default function App() {
  const sim = useSimulation();
  const [debugMode, setDebugMode] = useState(false);

  // 選択中ボールの実体を ref から取得する（statsの更新タイミングで再評価）。
  const selectedBall = useMemo(() => {
    if (sim.selectedBallId === null) return null;
    return (
      sim.ballsRef.current.find((b) => b.id === sim.selectedBallId) ?? null
    );
    // stats を依存に含め、テレメトリ更新ごとに最新の速度を反映する。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.selectedBallId, sim.stats, sim.ballsRef]);

  return (
    <div className="flex h-screen flex-col bg-surface text-slate-200">
      {/* ヘッダー */}
      <header className="flex items-center justify-between border-b border-surface-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 shadow-glow">
            <Boxes className="h-5 w-5 text-accent-soft" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-50">
              ProtoPlay 2D
            </h1>
            <p className="text-[11px] text-slate-500">
              Low-code 2D physics playground
            </p>
          </div>
        </div>
        <a
          href="https://github.com/NagaYu/protoplay-2d"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-accent/50 hover:text-white"
        >
          <Github className="h-4 w-4" />
          <span className="hidden sm:inline">Star on GitHub</span>
        </a>
      </header>

      {/* メイン: 2 カラム */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row">
        {/* 左カラム: ツールバー + Canvas + Dashboard */}
        <main className="flex min-h-0 flex-1 flex-col gap-4">
          <Toolbar
            paused={sim.paused}
            debugMode={debugMode}
            onTogglePause={sim.togglePause}
            onReset={sim.reset}
            onAddBall={sim.addBall}
            onToggleDebug={() => setDebugMode((d) => !d)}
          />
          <div className="min-h-0 flex-1">
            <GameCanvas
              ballsRef={sim.ballsRef}
              selectedBallId={sim.selectedBallId}
              debugMode={debugMode}
              onSelectBall={sim.selectBall}
              onResize={sim.setBounds}
              onTick={sim.tick}
            />
          </div>
          <Dashboard
            stats={sim.stats}
            energyHistory={sim.energyHistory}
            selectedBall={selectedBall}
          />
        </main>

        {/* 右カラム: コントロールパネル */}
        <aside className="w-full shrink-0 overflow-y-auto lg:w-80">
          <ControlPanel
            environment={sim.environment}
            spawn={sim.spawn}
            activePreset={sim.activePreset}
            onEnvironmentChange={sim.setEnvironment}
            onSpawnChange={sim.setSpawn}
            onApplyPreset={sim.applyPreset}
          />
        </aside>
      </div>
    </div>
  );
}
