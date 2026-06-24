import type { Ball, Environment, SimulationStats, Vec2 } from '../types';

/**
 * 自作 2D 物理エンジン。
 *
 * React に一切依存しない純粋なロジック層として実装する。
 * - 数値積分: セミインプリシット・オイラー法（速度を先に更新 → 位置を更新）。
 * - 壁 / 地面: 速度反転 × 反発係数。
 * - ボール同士: 質量を考慮した円の弾性衝突 + めり込み解消。
 *
 * 単位系: 位置は px、速度は px/frame、重力は基準 60fps を 1.0 とした
 * dt スケーリングで時間ステップ非依存に近づける。
 */

/** 描画領域の境界。 */
export interface Bounds {
  width: number;
  height: number;
}

/** ボールのカラーパレット（ランダム生成用）。 */
export const BALL_PALETTE: string[] = [
  '#5b8cff',
  '#ff6b6b',
  '#51cf66',
  '#ffd43b',
  '#cc5de8',
  '#22b8cf',
  '#ff922b',
  '#f783ac',
];

/** 重力の体感を整えるためのスケール係数。 */
const GRAVITY_SCALE = 0.06;
/** エネルギー計算で位置エネルギーの基準を地面に取るための係数。 */
const ENERGY_GRAVITY_SCALE = GRAVITY_SCALE;

let nextBallId = 1;

/** ID を採番した新しいボールを生成する。 */
export function createBall(params: {
  position: Vec2;
  velocity: Vec2;
  radius: number;
  mass: number;
  color: string;
}): Ball {
  return {
    id: nextBallId++,
    position: { ...params.position },
    velocity: { ...params.velocity },
    radius: params.radius,
    mass: params.mass,
    color: params.color,
  };
}

/** 範囲内の乱数。 */
function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * ランダムな初速・カラーを持つボールを境界内に生成する。
 * @param bounds 描画領域
 * @param radius 半径
 * @param mass 質量
 */
export function spawnRandomBall(
  bounds: Bounds,
  radius: number,
  mass: number,
): Ball {
  const color = BALL_PALETTE[Math.floor(Math.random() * BALL_PALETTE.length)];
  return createBall({
    position: {
      x: randomRange(radius, Math.max(radius, bounds.width - radius)),
      y: randomRange(radius, Math.max(radius, bounds.height * 0.5)),
    },
    velocity: {
      x: randomRange(-4, 4),
      y: randomRange(-2, 2),
    },
    radius,
    mass,
    color,
  });
}

/**
 * 1 ステップ分シミュレーションを進める（破壊的に balls を更新）。
 *
 * @param balls    更新対象のボール配列（in-place 更新）
 * @param env      環境パラメータ
 * @param bounds   描画領域
 * @param dt       フレーム時間スケール（60fps を 1.0 とする）
 */
export function step(
  balls: Ball[],
  env: Environment,
  bounds: Bounds,
  dt: number,
): void {
  const gravity = env.gravity * GRAVITY_SCALE;
  // 空気抵抗は dt に応じた減衰率に変換する。
  const damping = Math.pow(1 - env.airResistance, dt);

  // --- 積分（速度 → 位置） ---
  for (const ball of balls) {
    ball.velocity.y += gravity * dt;
    ball.velocity.x *= damping;
    ball.velocity.y *= damping;
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;
  }

  // --- 壁・地面との衝突 ---
  for (const ball of balls) {
    resolveBoundsCollision(ball, env, bounds);
  }

  // --- ボール同士の衝突 ---
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      resolveBallCollision(balls[i], balls[j], env.restitution);
    }
  }
}

/** 壁・地面との衝突を解決する（速度反転 × 反発係数 + めり込み補正）。 */
function resolveBoundsCollision(
  ball: Ball,
  env: Environment,
  bounds: Bounds,
): void {
  const r = ball.radius;
  const e = env.restitution;

  // 左壁
  if (ball.position.x - r < 0) {
    ball.position.x = r;
    ball.velocity.x = Math.abs(ball.velocity.x) * e;
  }
  // 右壁
  if (ball.position.x + r > bounds.width) {
    ball.position.x = bounds.width - r;
    ball.velocity.x = -Math.abs(ball.velocity.x) * e;
  }
  // 天井
  if (ball.position.y - r < 0) {
    ball.position.y = r;
    ball.velocity.y = Math.abs(ball.velocity.y) * e;
  }
  // 地面
  if (ball.position.y + r > bounds.height) {
    ball.position.y = bounds.height - r;
    ball.velocity.y = -Math.abs(ball.velocity.y) * e;
  }
}

/**
 * 2 つのボールの衝突を解決する。
 * 1 次元の弾性衝突公式を衝突法線方向に適用し、運動量と反発係数を反映する。
 */
function resolveBallCollision(a: Ball, b: Ball, restitution: number): void {
  const dx = b.position.x - a.position.x;
  const dy = b.position.y - a.position.y;
  const distSq = dx * dx + dy * dy;
  const minDist = a.radius + b.radius;

  if (distSq === 0 || distSq >= minDist * minDist) {
    return;
  }

  const dist = Math.sqrt(distSq);
  // 衝突法線（単位ベクトル）。
  const nx = dx / dist;
  const ny = dy / dist;

  // --- めり込み解消（質量に反比例して押し戻す） ---
  const overlap = minDist - dist;
  const totalMass = a.mass + b.mass;
  const aPush = (b.mass / totalMass) * overlap;
  const bPush = (a.mass / totalMass) * overlap;
  a.position.x -= nx * aPush;
  a.position.y -= ny * aPush;
  b.position.x += nx * bPush;
  b.position.y += ny * bPush;

  // --- 法線方向の相対速度 ---
  const rvx = b.velocity.x - a.velocity.x;
  const rvy = b.velocity.y - a.velocity.y;
  const velAlongNormal = rvx * nx + rvy * ny;

  // 既に離れる方向に動いているなら処理しない。
  if (velAlongNormal > 0) {
    return;
  }

  // 撃力（impulse scalar）。
  const impulse =
    (-(1 + restitution) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
  const ix = impulse * nx;
  const iy = impulse * ny;

  a.velocity.x -= ix / a.mass;
  a.velocity.y -= iy / a.mass;
  b.velocity.x += ix / b.mass;
  b.velocity.y += iy / b.mass;
}

/**
 * 現在のボール群から統計値を算出する。
 *
 * - 運動エネルギー: Σ ½ m v²
 * - 位置エネルギー: Σ m g h（h は地面からの高さ）
 *
 * @param balls  ボール配列
 * @param env    環境（重力を参照）
 * @param bounds 描画領域（地面基準の高さ算出に使用）
 * @param fps    直近フレームの FPS
 */
export function computeStats(
  balls: Ball[],
  env: Environment,
  bounds: Bounds,
  fps: number,
): SimulationStats {
  let kinetic = 0;
  let potential = 0;
  const g = env.gravity * ENERGY_GRAVITY_SCALE;

  for (const ball of balls) {
    const speedSq =
      ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y;
    kinetic += 0.5 * ball.mass * speedSq;

    // y は下向き正なので、地面（height）からの高さに変換する。
    const height = bounds.height - ball.position.y - ball.radius;
    potential += ball.mass * g * Math.max(0, height);
  }

  return {
    fps,
    kineticEnergy: kinetic,
    potentialEnergy: potential,
    totalEnergy: kinetic + potential,
    ballCount: balls.length,
  };
}

/** ベクトルの大きさ。 */
export function magnitude(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
