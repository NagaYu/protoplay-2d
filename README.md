<div align="center">

# 🎮 ProtoPlay 2D

### A low-code 2D physics playground powered by a hand-rolled HTML5 Canvas engine.

**Tweak gravity, bounciness, and air resistance in real time — and *watch* the physics with live telemetry.**

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-Try_it_now-5b8cff?style=for-the-badge)](https://NagaYu.github.io/protoplay-2d/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22b8cf?style=for-the-badge)](#-license)
[![Built with Vite](https://img.shields.io/badge/Vite-React_+_TS-ffd43b?style=for-the-badge&logo=vite&logoColor=black)](https://vite.dev)

> 🌐 **Demo:** https://NagaYu.github.io/protoplay-2d/ &nbsp;·&nbsp; _(placeholder — swap in your deployment URL)_

</div>

---

## ✨ Project Overview

**ProtoPlay 2D** is a browser-based sandbox for prototyping 2D physics behavior — *without* pulling in a heavyweight physics library. Every collision, every bounce, and every joule of energy is computed by a **purpose-built, dependency-free physics engine** written in plain TypeScript on top of the raw HTML5 Canvas API.

It's built for two kinds of people:

- 🎨 **Game designers & tinkerers** who want to *feel* how gravity and restitution change a scene — instantly, with a slider.
- 🔬 **Engineers & educators** who want to *see* conservation of energy hold (or decay under friction) in real time.

The result is a tool that is small, fast, hackable, and genuinely fun to poke at.

---

## 🚀 Features

### 🎛️ Real-Time Parameter Control
Drag a slider, change the universe. Every physics parameter updates the live simulation with zero recompilation:

| Parameter | Range | Effect |
| --- | --- | --- |
| **Gravity** | `0 – 30` | Downward acceleration |
| **Bounciness** (restitution) | `0.0 – 1.0` | Energy retained per bounce |
| **Air Resistance** | `0.0 – 0.1` | Velocity damping per frame |
| **Ball Radius / Mass** | configurable | Shapes the next ball you spawn |

### 📊 Live Telemetry Dashboard — *the differentiator*
Most playgrounds show you balls. **ProtoPlay 2D shows you the physics.** A built-in observability panel renders:

- ⚡ **Real-time FPS** with color-coded health (green / amber / red).
- 🔋 **Total system energy** (potential + kinetic) as a live SVG sparkline — watch energy stay flat in a perfectly elastic world, or decay smoothly as air resistance bleeds it away.
- 🎯 **Per-ball velocity vector** — click any ball to inspect its `vx`, `vy`, `|v|`, and mass, visualized as an on-canvas arrow.

> Toggle **Debug** mode to overlay velocity vectors on *every* ball at once.

### 🌍 One-Click Environment Presets
Jump between four hand-tuned worlds instantly:

| Preset | Vibe |
| --- | --- |
| 🌎 **Earth** | Familiar gravity with gentle air drag |
| 🌙 **Moon** | ~1/6 gravity — long, floaty arcs |
| 🚀 **Space** | Zero gravity, perfectly elastic drifting |
| ✨ **Super Bounce** | High-restitution rubber world that barely loses energy |

### 🧮 Hand-Rolled Physics Engine
- Semi-implicit Euler integration for stability.
- Mass-aware elastic **ball-to-ball collisions** with impulse resolution and penetration correction.
- Wall & floor collisions via velocity reflection scaled by restitution.
- Zero external physics dependencies — the whole engine lives in [`src/physics/engine.ts`](src/physics/engine.ts) and is fully unit-testable as pure functions.

---

## ⚡ Quick Start

Get it running locally in under a minute:

```bash
# 1. Clone
git clone https://github.com/NagaYu/protoplay-2d.git
cd protoplay-2d

# 2. Install
npm install

# 3. Run
npm run dev
```

Then open the printed URL (default **http://localhost:5173**) and start dragging sliders. 🎉

**Build for production:**

```bash
npm run build      # type-check + bundle → dist/
npm run preview    # serve the production build locally
```

---

## 🗂️ Project Structure

```
protoplay-2d/
├── CLAUDE.md                  # Engineering conventions & architecture notes
├── index.html                 # App entry
└── src/
    ├── types.ts               # Shared type definitions (single source of truth)
    ├── physics/
    │   ├── engine.ts          # The core engine: integration, collisions, energy
    │   └── presets.ts         # Earth / Moon / Space / Super Bounce definitions
    ├── hooks/
    │   └── useSimulation.ts    # requestAnimationFrame loop + state orchestration
    ├── components/
    │   ├── GameCanvas.tsx      # Left column — Canvas rendering & picking
    │   ├── ControlPanel.tsx    # Right column — parameter sliders
    │   ├── Toolbar.tsx         # Pause / Reset / Add Ball / Debug
    │   ├── Dashboard.tsx       # FPS, energy sparkline, velocity inspector
    │   ├── PresetButtons.tsx   # Environment preset switcher
    │   └── ui/Slider.tsx       # Reusable styled slider
    ├── App.tsx                 # Two-column layout integration
    └── main.tsx                # React bootstrap
```

**Design principle:** the physics layer (`src/physics/`) has **no React dependency**. UI and logic are cleanly separated, so the engine can be reused, tested, or ported independently.

---

## 🤝 Contributing

Contributions are welcome and appreciated! Whether it's a bug fix, a new preset, or a whole new force field — here's the flow:

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feature/my-cool-idea
   ```
2. **Develop** with `npm run dev`. Keep the architecture clean:
   - Put pure physics in `src/physics/`.
   - Keep components single-responsibility.
   - TypeScript stays strict — no `any`.
3. **Verify** before opening a PR — this must pass with zero errors:
   ```bash
   npm run build
   npm run lint
   ```
4. **Open a Pull Request** with a clear description of what and why.

💡 **Good first issues:** add a new environment preset, implement drag-to-throw, add a trail/motion-blur effect, or write unit tests for `engine.ts`.

---

## 📄 License

Released under the **MIT License**. See [`LICENSE`](LICENSE) for details — use it, fork it, ship it.

<div align="center">

---

**Built with ⚡ Vite · ⚛️ React · 🎨 Tailwind CSS · 🖌️ Lucide — and a physics engine written from scratch.**

_If ProtoPlay 2D made you smile, consider leaving a ⭐ — it genuinely helps._

</div>
