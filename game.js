// Stanford Tree Game: the blank screen.
// Everything a game needs is wired up (canvas, loop, input, images).
// Your game goes in update() and draw() at the bottom of this file.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ---------------------------------------------------------------------------
// Screen: the canvas fills the window and stays sharp on retina displays.
// Draw in CSS pixels using screen.width / screen.height.
// ---------------------------------------------------------------------------
const screen = { width: 0, height: 0 };

function resize() {
  const dpr = window.devicePixelRatio || 1;
  screen.width = window.innerWidth;
  screen.height = window.innerHeight;
  canvas.width = Math.round(screen.width * dpr);
  canvas.height = Math.round(screen.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

// ---------------------------------------------------------------------------
// Images: add more with loadImage("assets/your-file.png").
// ---------------------------------------------------------------------------
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const images = {
  tree: loadImage("assets/tree.png"), // 834x1076, for title screens
  treeSmall: loadImage("assets/tree-small.png"), // 198x256, for gameplay
};

function drawImage(img, x, y, width, height) {
  if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, x, y, width, height);
}

// ---------------------------------------------------------------------------
// Input: keyboard, mouse, and touch.
//   input.isDown("ArrowLeft")   true while the key is held
//   input.wasPressed("Space")   true for one frame when the key goes down
//   input.pointer               { x, y, down, pressed } for mouse and touch
// Key names follow KeyboardEvent.code: "Space", "ArrowUp", "KeyW", "Enter", ...
// ---------------------------------------------------------------------------
const input = {
  held: new Set(),
  pressed: new Set(),
  pointer: { x: 0, y: 0, down: false, pressed: false },
  isDown(code) {
    return this.held.has(code);
  },
  wasPressed(code) {
    return this.pressed.has(code);
  },
  anyPressed() {
    return this.pressed.size > 0 || this.pointer.pressed;
  },
  endFrame() {
    this.pressed.clear();
    this.pointer.pressed = false;
  },
};

const GAME_KEYS = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

window.addEventListener("keydown", (e) => {
  if (GAME_KEYS.has(e.code)) e.preventDefault();
  if (!input.held.has(e.code)) input.pressed.add(e.code);
  input.held.add(e.code);
});
window.addEventListener("keyup", (e) => input.held.delete(e.code));
window.addEventListener("blur", () => input.held.clear());

function setPointer(e) {
  input.pointer.x = e.clientX;
  input.pointer.y = e.clientY;
}
canvas.addEventListener("pointerdown", (e) => {
  setPointer(e);
  input.pointer.down = true;
  input.pointer.pressed = true;
});
canvas.addEventListener("pointermove", setPointer);
window.addEventListener("pointerup", () => (input.pointer.down = false));

// ---------------------------------------------------------------------------
// Game loop: calls update(dt) then draw() every frame. dt is in seconds.
// ---------------------------------------------------------------------------
let lastTime = performance.now();

function frame(now) {
  // Clamp dt so a backgrounded tab doesn't teleport everything on return.
  const dt = Math.min((now - lastTime) / 1000, 1 / 20);
  lastTime = now;
  update(dt);
  draw();
  input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ===========================================================================
// YOUR GAME STARTS HERE. Replace the placeholder below with your game.
// ===========================================================================

// Tree Run: Cardy runs across Main Quad, jumping over bikes and scooters.
// Sizes use u() (1% of the screen's short side) so it plays the same on any screen.

const COLORS = {
  cardinal: "#8C1515",
  cardinalDark: "#4a0b0b",
  sunset: "#E98300",
  grass: "#2d7a4f",
  green: "#175E54",
  sand: "#F4F1EC",
  sandstone: "#D2B48C",
  roof: "#a8442a",
};
const BEST_KEY = "treeRunHighScore";
const JUMP_KEYS = ["Space", "ArrowUp", "KeyW"];

const game = { state: "title", time: 0, runTime: 0, overTime: 0, score: 0, best: 0, newBest: false, speed: 0, scroll: 0, nextSpawn: 0 };
const cardy = { y: 0, vy: 0, onGround: true, cut: false };
let obstacles = [];
let particles = [];

// localStorage can throw in private browsing; the game still works without it.
try {
  game.best = Number(localStorage.getItem(BEST_KEY)) || 0;
} catch {}

const u = () => Math.min(screen.height, screen.width * 1.2) / 100;
const groundY = () => screen.height * 0.8;
const treeX = () => screen.width * 0.2;
const treeSize = () => ({ w: u() * 22 * (198 / 256), h: u() * 22 });
const jumpPressed = () => JUMP_KEYS.some((k) => input.wasPressed(k)) || input.pointer.pressed;
const jumpHeld = () => JUMP_KEYS.some((k) => input.isDown(k)) || input.pointer.down;
const startPressed = () => jumpPressed() || input.wasPressed("Enter");

function startRun() {
  Object.assign(game, { state: "playing", runTime: 0, score: 0, newBest: false, nextSpawn: 1.2 });
  Object.assign(cardy, { y: 0, vy: 0, onGround: true, cut: false });
  obstacles = [];
  particles = [];
}

function endRun() {
  game.state = "over";
  game.overTime = 0;
  if (game.score > game.best) {
    game.best = game.score;
    game.newBest = true;
    try {
      localStorage.setItem(BEST_KEY, String(game.best));
    } catch {}
  }
}

function spawnObstacle() {
  const bike = Math.random() < 0.55;
  const w = u() * (bike ? 17 : 10);
  obstacles.push({ type: bike ? "bike" : "scooter", x: screen.width + w, w, h: u() * (bike ? 11 : 14), passed: false });
}

function puff(count) {
  for (let i = 0; i < count; i++) {
    const x = treeX() + treeSize().w / 2 + (Math.random() - 0.5) * u() * 8;
    const vx = (Math.random() - 0.7) * u() * 30;
    particles.push({ x, y: groundY(), vx, vy: -Math.random() * u() * 20, life: 0.4 + Math.random() * 0.3, age: 0 });
  }
}

function update(dt) {
  game.time += dt;
  for (const p of particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += u() * 40 * dt;
  }
  particles = particles.filter((p) => p.age < p.life);

  if (game.state === "title") {
    game.scroll += u() * 25 * dt;
    if (startPressed()) startRun();
    return;
  }
  if (game.state === "over") {
    game.overTime += dt;
    // Short delay so a panicked jump press doesn't skip the game over screen.
    if (game.overTime > 0.6 && startPressed()) startRun();
    return;
  }

  game.runTime += dt;
  game.speed = Math.min(u() * (60 + 3 * game.runTime), u() * 130);
  game.scroll += game.speed * dt;

  // Jump arc: about 0.7s in the air and 30u high. Releasing early cuts it short.
  if (cardy.onGround && jumpPressed()) Object.assign(cardy, { vy: u() * 172, onGround: false, cut: false });
  if (!cardy.onGround) {
    if (!cardy.cut && cardy.vy > 0 && !jumpHeld()) {
      cardy.vy *= 0.55;
      cardy.cut = true;
    }
    cardy.vy -= u() * 490 * dt;
    cardy.y += cardy.vy * dt;
    if (cardy.y <= 0) {
      Object.assign(cardy, { y: 0, vy: 0, onGround: true });
      puff(8);
    }
  }

  game.nextSpawn -= dt;
  if (game.nextSpawn <= 0) {
    spawnObstacle();
    // Gaps shrink as the run goes on, but never below a clearable distance.
    game.nextSpawn = Math.max(0.75, 1.3 - game.runTime * 0.01) + Math.random() * 0.9;
  }

  // Forgiving hitboxes: Cardy is inset 25% on the sides and 20% from the top.
  const t = treeSize();
  const hx = treeX() + t.w * 0.25;
  const hw = t.w * 0.5;
  const hBottom = groundY() - cardy.y - t.h * 0.05;
  for (const o of obstacles) {
    o.x -= game.speed * dt;
    if (!o.passed && o.x + o.w < hx) {
      o.passed = true;
      game.score += 1;
    }
    const ox = o.x + o.w * 0.18;
    if (hx < ox + o.w * 0.64 && hx + hw > ox && hBottom > groundY() - o.h * 0.8) {
      puff(18);
      endRun();
      return;
    }
  }
  obstacles = obstacles.filter((o) => o.x + o.w > 0);
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function drawBackground() {
  const { width, height } = screen;
  const gy = groundY();
  const s = u();

  const sky = ctx.createLinearGradient(0, 0, 0, gy);
  sky.addColorStop(0, COLORS.cardinalDark);
  sky.addColorStop(0.55, COLORS.cardinal);
  sky.addColorStop(1, COLORS.sunset);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, gy);
  ctx.fillStyle = "rgba(255, 214, 140, 0.85)";
  ctx.beginPath();
  ctx.arc(width * 0.72, gy - s * 26, s * 11, 0, Math.PI * 2);
  ctx.fill();

  // Far layer: Hoover Tower silhouette, slow parallax.
  const spacing = width * 1.3;
  ctx.fillStyle = "rgba(60, 10, 10, 0.6)";
  for (let x = width * 0.15 - ((game.scroll * 0.1) % spacing); x < width + spacing; x += spacing) {
    const top = gy - s * 58;
    ctx.fillRect(x, top, s * 9, gy - top);
    ctx.fillRect(x - s * 1.2, top + s * 6, s * 11.4, s * 2);
    ctx.fillRect(x + s, top - s * 6, s * 7, s * 6);
    ctx.beginPath();
    ctx.ellipse(x + s * 4.5, top - s * 6, s * 4, s * 4.5, 0, Math.PI, 0);
    ctx.fill();
  }

  // Middle layer: sandstone arcade with a red tile roof.
  const archW = s * 14;
  const wallTop = gy - s * 20;
  ctx.fillStyle = COLORS.roof;
  ctx.fillRect(0, wallTop - s * 3, width, s * 3);
  ctx.fillStyle = COLORS.sandstone;
  ctx.fillRect(0, wallTop, width, gy - wallTop);
  ctx.fillStyle = "rgba(70, 30, 20, 0.55)";
  for (let x = -((game.scroll * 0.35) % archW); x < width + archW; x += archW) {
    const aw = archW * 0.62;
    const ax = x + (archW - aw) / 2;
    const top = wallTop + s * 6 + aw / 2;
    ctx.beginPath();
    ctx.moveTo(ax, gy);
    ctx.arc(ax + aw / 2, top, aw / 2, Math.PI, 0);
    ctx.lineTo(ax + aw, gy);
    ctx.fill();
  }

  // Ground: grass edge with scrolling path marks, then deep green.
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, gy, width, s * 4);
  ctx.fillStyle = COLORS.green;
  ctx.fillRect(0, gy + s * 4, width, height - gy);
  ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
  const dash = s * 12;
  for (let x = -(game.scroll % dash); x < width; x += dash) ctx.fillRect(x, gy + s * 1.5, dash * 0.45, s);
}

function line(points) {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
}

function drawBike(o, gy) {
  const r = o.h * 0.38;
  const back = [o.x + r, gy - r];
  const front = [o.x + o.w - r, gy - r];
  const crank = [o.x + o.w * 0.5, gy - r];
  const seat = [o.x + o.w * 0.38, gy - o.h * 0.85];
  const head = [o.x + o.w * 0.72, gy - o.h * 0.85];
  ctx.lineWidth = Math.max(2, r * 0.22);
  ctx.strokeStyle = "#1c1c1c";
  for (const [x, y] of [back, front]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = COLORS.cardinal;
  line([back, seat, head, front]);
  line([back, crank, seat]);
  line([crank, head, [head[0], gy - o.h]]);
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(seat[0] - r * 0.45, seat[1] - r * 0.2, r * 0.9, r * 0.3);
  ctx.fillRect(head[0] - r * 0.3, gy - o.h - r * 0.1, r * 0.8, r * 0.25);
}

function drawScooter(o, gy) {
  const r = o.h * 0.13;
  ctx.fillStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.arc(o.x + r, gy - r, r, 0, Math.PI * 2);
  ctx.arc(o.x + o.w - r, gy - r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ctx.strokeStyle = "#3aa0a0";
  ctx.fillRect(o.x, gy - r * 2.2, o.w * 0.85, r * 0.9);
  ctx.lineWidth = Math.max(2, r * 0.6);
  line([[o.x + o.w - r, gy - r], [o.x + o.w * 0.78, gy - o.h], [o.x + o.w * 0.5, gy - o.h]]);
}

function drawCardy() {
  const { w, h } = treeSize();
  const x = treeX();
  const gy = groundY();
  const shadow = Math.max(0.35, 1 - cardy.y / (u() * 40));
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, gy + u() * 0.8, w * 0.4 * shadow, u() * 1.4 * shadow, 0, 0, Math.PI * 2);
  ctx.fill();
  const running = game.state === "playing" && cardy.onGround;
  const bob = running ? Math.abs(Math.sin(game.runTime * 14)) * u() * 1.2 : 0;
  drawImage(images.treeSmall, x, gy - h - cardy.y - bob + h * 0.02, w, h);

  ctx.fillStyle = COLORS.sandstone;
  for (const p of particles) {
    ctx.globalAlpha = 1 - p.age / p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, u() * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function text(str, x, y, size, { align = "center", weight = 800, blink = false } = {}) {
  ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.globalAlpha = blink ? 0.65 + Math.sin(game.time * 5) * 0.35 : 1;
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillText(str, x + size * 0.05, y + size * 0.07);
  ctx.fillStyle = COLORS.sand;
  ctx.fillText(str, x, y);
  ctx.globalAlpha = 1;
}

function draw() {
  const { width, height } = screen;
  const s = u();
  const gy = groundY();
  drawBackground();

  if (game.state === "title") {
    const th = Math.min(height * 0.42, width * 0.6);
    const tw = th * (834 / 1076);
    drawImage(images.tree, width / 2 - tw / 2, gy - th * 0.98 + Math.sin(game.time * 3) * s, tw, th);
    text("TREE RUN", width / 2, height * 0.15, Math.min(width * 0.16, s * 14), { weight: 900 });
    text("PRESS SPACE OR TAP TO START", width / 2, height * 0.15 + s * 11, Math.min(width * 0.045, s * 4.2), { weight: 600, blink: true });
    if (game.best > 0) text(`BEST ${game.best}`, width / 2, gy + (height - gy) / 2, s * 4.5, { weight: 700 });
    return;
  }

  for (const o of obstacles) (o.type === "bike" ? drawBike : drawScooter)(o, gy);
  drawCardy();

  const pad = s * 4;
  text(String(game.score), width - pad, pad + s * 4, s * 9, { align: "right", weight: 900 });
  text(`BEST ${Math.max(game.best, game.score)}`, width - pad, pad + s * 11, s * 3.6, { align: "right", weight: 700 });
  if (game.state === "playing" && game.runTime < 3) {
    text("SPACE OR TAP TO JUMP", width / 2, gy + (height - gy) / 2, s * 4, { weight: 600, blink: true });
  }

  if (game.state === "over") {
    const pw = Math.min(width * 0.86, s * 80);
    const ph = s * 46;
    const py = height * 0.4 - ph / 2;
    ctx.fillStyle = "rgba(40, 6, 6, 0.75)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(width / 2 - pw / 2, py, pw, ph, s * 3);
    else ctx.rect(width / 2 - pw / 2, py, pw, ph);
    ctx.fill();
    text("GAME OVER", width / 2, py + ph * 0.18, Math.min(pw * 0.13, s * 10), { weight: 900 });
    text(`SCORE ${game.score}`, width / 2, py + ph * 0.44, s * 6);
    text(game.newBest ? "NEW BEST!" : `BEST ${game.best}`, width / 2, py + ph * 0.62, s * 4.4, { weight: 700 });
    if (game.overTime > 0.6) {
      const size = Math.min(pw * 0.045, s * 3.6);
      text("PRESS SPACE OR TAP TO PLAY AGAIN", width / 2, py + ph * 0.84, size, { weight: 600, blink: true });
    }
  }
}
