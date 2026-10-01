// Stanford Tree Game engine: the pixel screen, sprites, text, input, sound,
// and the game loop. You rarely need to change this file. The game itself
// lives in game.js, and the art lives in sprites.js.

// ---------------------------------------------------------------------------
// Screen: a fixed 256x192 pixel canvas, scaled up crisply by CSS.
// Draw in screen pixels: (0, 0) is the top left, (255, 191) the bottom right.
// ---------------------------------------------------------------------------
const screen = { width: 256, height: 192 };

const canvas = document.getElementById("game");
canvas.width = screen.width;
canvas.height = screen.height;
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

function rect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function clear(color) {
  rect(0, 0, screen.width, screen.height, color);
}

// ---------------------------------------------------------------------------
// Sprites: drawSprite("cardyRun1", x, y) draws a sprite from sprites.js with
// its top left corner at (x, y). Pass { flip: true } to mirror it.
// spriteSize("cone") returns { width, height }.
// ---------------------------------------------------------------------------
const spriteCache = {};

function bakeSprite(name, flip) {
  const rows = SPRITES[name];
  if (!rows) throw new Error(`No sprite named "${name}" in sprites.js`);
  const c = document.createElement("canvas");
  c.width = rows[0].length;
  c.height = rows.length;
  const g = c.getContext("2d");
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === "." || ch === " ") return;
      g.fillStyle = PALETTE[ch] || "#ff00ff";
      g.fillRect(flip ? c.width - 1 - x : x, y, 1, 1);
    });
  });
  return c;
}

function drawSprite(name, x, y, options = {}) {
  const key = options.flip ? `${name}:flip` : name;
  if (!spriteCache[key]) spriteCache[key] = bakeSprite(name, options.flip);
  ctx.drawImage(spriteCache[key], Math.round(x), Math.round(y));
}

function spriteSize(name) {
  const rows = SPRITES[name];
  return { width: rows[0].length, height: rows.length };
}

// ---------------------------------------------------------------------------
// Text: a built-in 5x7 pixel font.
//   drawText("GAME OVER", 128, 80, { color: "#fff", scale: 2, align: "center" })
//   textWidth("SCORE", 1)
// Letters are drawn in uppercase. Supported: A-Z 0-9 and ! ? . , : - ' / +
// ---------------------------------------------------------------------------
const FONT = {
  A: ".###. #...# #...# ##### #...# #...# #...#",
  B: "####. #...# #...# ####. #...# #...# ####.",
  C: ".###. #...# #.... #.... #.... #...# .###.",
  D: "####. #...# #...# #...# #...# #...# ####.",
  E: "##### #.... #.... ####. #.... #.... #####",
  F: "##### #.... #.... ####. #.... #.... #....",
  G: ".###. #...# #.... #.### #...# #...# .####",
  H: "#...# #...# #...# ##### #...# #...# #...#",
  I: ".###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.",
  J: "..### ...#. ...#. ...#. ...#. #..#. .##..",
  K: "#...# #..#. #.#.. ##... #.#.. #..#. #...#",
  L: "#.... #.... #.... #.... #.... #.... #####",
  M: "#...# ##.## #.#.# #.#.# #...# #...# #...#",
  N: "#...# #...# ##..# #.#.# #..## #...# #...#",
  O: ".###. #...# #...# #...# #...# #...# .###.",
  P: "####. #...# #...# ####. #.... #.... #....",
  Q: ".###. #...# #...# #...# #.#.# #..#. .##.#",
  R: "####. #...# #...# ####. #.#.. #..#. #...#",
  S: ".#### #.... #.... .###. ....# ....# ####.",
  T: "##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..",
  U: "#...# #...# #...# #...# #...# #...# .###.",
  V: "#...# #...# #...# #...# #...# .#.#. ..#..",
  W: "#...# #...# #...# #.#.# #.#.# #.#.# .#.#.",
  X: "#...# #...# .#.#. ..#.. .#.#. #...# #...#",
  Y: "#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..",
  Z: "##### ....# ...#. ..#.. .#... #.... #####",
  0: ".###. #...# #..## #.#.# ##..# #...# .###.",
  1: "..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.",
  2: ".###. #...# ....# ...#. ..#.. .#... #####",
  3: "####. ....# ....# .###. ....# ....# ####.",
  4: "...#. ..##. .#.#. #..#. ##### ...#. ...#.",
  5: "##### #.... ####. ....# ....# #...# .###.",
  6: "..##. .#... #.... ####. #...# #...# .###.",
  7: "##### ....# ...#. ..#.. .#... .#... .#...",
  8: ".###. #...# #...# .###. #...# #...# .###.",
  9: ".###. #...# #...# .#### ....# ...#. .##..",
  "!": "..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..",
  "?": ".###. #...# ....# ...#. ..#.. ..... ..#..",
  ".": "..... ..... ..... ..... ..... ..... ..#..",
  ",": "..... ..... ..... ..... ..... ..#.. .#...",
  ":": "..... ..#.. ..#.. ..... ..#.. ..#.. .....",
  "-": "..... ..... ..... ##### ..... ..... .....",
  "'": "..#.. ..#.. .#... ..... ..... ..... .....",
  "/": "....# ...#. ...#. ..#.. .#... .#... #....",
  "+": "..... ..#.. ..#.. ##### ..#.. ..#.. .....",
};

function textWidth(text, scale = 1) {
  return text.length === 0 ? 0 : (text.length * 6 - 1) * scale;
}

function drawText(text, x, y, options = {}) {
  const { color = PALETTE.K, scale = 1, align = "left" } = options;
  text = String(text).toUpperCase();
  let left = x;
  if (align === "center") left = x - textWidth(text, scale) / 2;
  if (align === "right") left = x - textWidth(text, scale);
  left = Math.round(left);
  ctx.fillStyle = color;
  [...text].forEach((ch, i) => {
    const glyph = FONT[ch];
    if (!glyph) return;
    glyph.split(" ").forEach((row, gy) => {
      [...row].forEach((bit, gx) => {
        if (bit === "#") ctx.fillRect(left + (i * 6 + gx) * scale, Math.round(y) + gy * scale, scale, scale);
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Input: keyboard, mouse, touch, and the on-screen keys of the computer.
//   input.isDown("ArrowDown")   true while the key is held
//   input.wasPressed("Space")   true for one frame when the key goes down
//   input.wasReleased("Space")  true for one frame when the key goes up
//   input.pointer               { x, y, down, pressed } in screen pixels
// Key names follow KeyboardEvent.code: "Space", "ArrowUp", "KeyW", "Enter", ...
// ---------------------------------------------------------------------------
const input = {
  held: new Set(),
  pressed: new Set(),
  released: new Set(),
  pointer: { x: 0, y: 0, down: false, pressed: false },
  isDown(code) {
    return this.held.has(code);
  },
  wasPressed(code) {
    return this.pressed.has(code);
  },
  wasReleased(code) {
    return this.released.has(code);
  },
  anyPressed() {
    return this.pressed.size > 0 || this.pointer.pressed;
  },
  press(code) {
    unlockAudio();
    if (!this.held.has(code)) this.pressed.add(code);
    this.held.add(code);
    showKey(code, true);
  },
  release(code) {
    if (this.held.has(code)) this.released.add(code);
    this.held.delete(code);
    showKey(code, false);
  },
  endFrame() {
    this.pressed.clear();
    this.released.clear();
    this.pointer.pressed = false;
  },
};

// Light up matching keys on the computer's keyboard (elements with data-key).
function showKey(code, down) {
  document.querySelectorAll(`[data-key="${code}"]`).forEach((el) => el.classList.toggle("down", down));
}

const GAME_KEYS = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

window.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey) return;
  if (GAME_KEYS.has(e.code)) e.preventDefault();
  input.press(e.code);
});
window.addEventListener("keyup", (e) => input.release(e.code));
window.addEventListener("blur", () => [...input.held].forEach((code) => input.release(code)));

function setPointer(e) {
  const box = canvas.getBoundingClientRect();
  input.pointer.x = ((e.clientX - box.left) / box.width) * screen.width;
  input.pointer.y = ((e.clientY - box.top) / box.height) * screen.height;
}
canvas.addEventListener("pointerdown", (e) => {
  unlockAudio();
  setPointer(e);
  input.pointer.down = true;
  input.pointer.pressed = true;
});
canvas.addEventListener("pointermove", setPointer);
window.addEventListener("pointerup", () => (input.pointer.down = false));
window.addEventListener("pointercancel", () => (input.pointer.down = false));

// On-screen keys: tap or click any element with data-key="Space" etc.
document.querySelectorAll("[data-key]").forEach((el) => {
  const code = el.dataset.key;
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    input.press(code);
    // Capture keeps the key held even if a thumb slides off it.
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
  });
  const up = () => input.release(code);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("lostpointercapture", up);
});

// ---------------------------------------------------------------------------
// Sound: beep(frequency, seconds, { type, volume, slideTo }) plays a retro
// blip with the Web Audio API. No sound files needed. Press M to mute.
// ---------------------------------------------------------------------------
let audio = null;
let muted = false;

// Browsers only allow sound after the player presses a key or taps, so the
// audio context is created inside those input handlers.
function unlockAudio() {
  if (!audio) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audio = new AudioContext();
  }
  if (audio && audio.state === "suspended") audio.resume();
}

function beep(frequency, seconds = 0.1, options = {}) {
  if (!audio || muted) return;
  const { type = "square", volume = 0.04, slideTo } = options;
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + seconds);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + seconds);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyM") muted = !muted;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// True when two boxes { x, y, width, height } overlap.
function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

// Saved data that survives a page refresh, such as a high score.
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Game loop: calls update(dt) then draw() every frame. dt is in seconds.
// game.js defines update() and draw().
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

window.addEventListener("load", () => requestAnimationFrame(frame));
