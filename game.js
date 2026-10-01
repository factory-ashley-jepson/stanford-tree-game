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

const COLORS = {
  cardinal: "#8C1515",
  cardinalDark: "#5e0e0e",
  green: "#175E54",
  sand: "#F4F1EC",
};

const tree = { hop: 0, velocity: 0, time: 0 };

function update(dt) {
  tree.time += dt;

  // Any key, click, or tap makes Cardy hop, so you can see input working.
  if (input.anyPressed() && tree.hop === 0) tree.velocity = 520;
  tree.velocity -= 1400 * dt;
  tree.hop = Math.max(0, tree.hop + tree.velocity * dt);
  if (tree.hop === 0) tree.velocity = 0;
}

function draw() {
  const { width, height } = screen;
  const groundY = height * 0.82;

  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, COLORS.cardinalDark);
  sky.addColorStop(1, COLORS.cardinal);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, groundY);

  ctx.fillStyle = COLORS.green;
  ctx.fillRect(0, groundY, width, height - groundY);

  const treeHeight = Math.min(height * 0.5, 420);
  const treeWidth = treeHeight * (834 / 1076);
  const bob = tree.hop === 0 ? Math.sin(tree.time * 3) * 4 : 0;
  const treeX = width / 2 - treeWidth / 2;
  const treeY = groundY - treeHeight - tree.hop + bob + treeHeight * 0.02;

  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  const shadow = Math.max(0.4, 1 - tree.hop / 300);
  ctx.ellipse(width / 2, groundY + 6, treeWidth * 0.38 * shadow, 10 * shadow, 0, 0, Math.PI * 2);
  ctx.fill();

  drawImage(images.tree, treeX, treeY, treeWidth, treeHeight);

  ctx.fillStyle = COLORS.sand;
  ctx.textAlign = "center";
  ctx.font = `600 ${Math.max(24, Math.min(width / 18, 52))}px system-ui, sans-serif`;
  ctx.fillText("Your game starts here", width / 2, Math.max(70, height * 0.13));
  ctx.font = `400 ${Math.max(14, Math.min(width / 50, 20))}px ui-monospace, monospace`;
  ctx.globalAlpha = 0.6 + Math.sin(tree.time * 4) * 0.2;
  ctx.fillText("PRESS ANY KEY OR TAP", width / 2, Math.max(105, height * 0.13 + 38));
  ctx.globalAlpha = 1;
}
