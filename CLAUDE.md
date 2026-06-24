# CLAUDE.md

このファイルは、Claude（および他の開発者）がこのリポジトリで作業する際の行動指針を定義します。

## プロジェクト概要

**ProtoPlay 2D** は、素の HTML5 Canvas による自作物理エンジンを搭載した、
ローコードな 2D 物理ゲーム・プロトタイピングツールです。
重力・反発係数・空気抵抗などの環境パラメータをリアルタイムに操作し、
シミュレーションの挙動を即座に可視化できます。

## コマンド

| 目的 | コマンド |
| --- | --- |
| 開発サーバー起動 | `npm run dev` |
| 本番ビルド | `npm run build` |
| ビルド結果のプレビュー | `npm run preview` |
| Lint チェック | `npm run lint` |
| 型チェック | `npm run typecheck` |

**完了基準**: コードを変更したら必ず `npm run build` と `npm run lint` を実行し、
TypeScript エラーが「ゼロ」でビルドが通ることを確認すること。

## コード規約

- **型定義は厳格に**: `tsconfig` の `strict` を有効にし、`any` は原則禁止。
  共有する型は `src/types.ts` に集約する。
- **UI とロジックの分離**: 物理演算ロジック（`src/physics/`）は React に依存させない。
  純粋関数・純粋クラスとして実装し、コンポーネントから呼び出す。
- **コンポーネントのクリーンな分割**: 1 コンポーネント 1 責務。
  Canvas 描画（`GameCanvas`）、操作 UI（`ControlPanel`）、統計表示（`Dashboard`）などを分離する。
- **スタイリング**: Tailwind CSS のユーティリティクラスで統一。インライン style は座標計算など動的な場合のみ。
- **アイコン**: Lucide React を使用する。
- **コミットメッセージ**: 意味のある日本語で記述する（例: `重力スライダーの境界値バグを修正`）。

## アーキテクチャ

```
src/
├── types.ts              … 共有型定義（Ball, Environment, Preset など）
├── physics/
│   ├── engine.ts         … 物理ステップ計算（重力・抵抗・衝突・積分）
│   └── presets.ts        … 環境プリセット定義
├── hooks/
│   └── useSimulation.ts  … requestAnimationFrame ループと状態管理
├── components/
│   ├── GameCanvas.tsx    … Canvas 描画（左カラム）
│   ├── ControlPanel.tsx  … パラメータ操作 UI（右カラム）
│   ├── Toolbar.tsx       … Pause / Reset / Add Ball
│   ├── Dashboard.tsx     … FPS・総エネルギー・速度ベクトルの可視化
│   ├── PresetButtons.tsx … 環境プリセット切り替え
│   └── ui/Slider.tsx     … 再利用可能なスライダー UI
└── App.tsx               … 2 カラムレイアウトの統合
```

## 物理エンジンの方針

- 単位は「ピクセル / フレーム」を基本とし、`dt` で正規化する。
- 数値積分はセミインプリシット・オイラー法（速度を先に更新してから位置を更新）。
- ボール同士の衝突は円同士の弾性衝突（質量を考慮した運動量保存）で近似する。
- 壁・地面との衝突は速度反転 × 反発係数で表現する。
