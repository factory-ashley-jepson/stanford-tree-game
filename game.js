// Big Game Run: a remix of Tree Run starring Cardy, the Stanford Tree.
// Jump over cones, bikes, and Cal Bears, duck under birds, grab acorns and
// boba, and run from day into night.
//
// This is the whole game. The art is in sprites.js and the helpers
// (drawSprite, drawText, input, beep, ...) are in engine.js.

// ---------------------------------------------------------------------------
// Tuning: try changing these first.
// ---------------------------------------------------------------------------
const GROUND_Y = 168; // y of the ground line, in screen pixels
const GRAVITY = 1100; // pixels per second per second
const JUMP_SPEED = 330; // how hard Cardy jumps
const DOUBLE_JUMP_SPEED = 260; // the extra mid-air jump is a little smaller
const START_SPEED = 110; // how fast the world scrolls at the start
const MAX_SPEED = 290;
const SPEED_UP = 3.5; // speed gained per second
const BIRDS_AT = 200; // score when birds start showing up
const BEARS_AT = 300; // score when Cal Bears start showing up
const BEAR_EXTRA_SPEED = 40; // bears walk toward Cardy, faster than the scroll
const DAY_LENGTH = 500; // points between day and night
const NIGHT_FADE = 1.5; // seconds to fade between day and night
const FADE_STEPS = 6; // the fade moves in a few chunky steps, the retro way
const ACORN_POINTS = 25;
const ACORN_CHANCE = 0.55; // chance of an acorn in each gap between obstacles
const BOBA_CHANCE = 0.08; // chance of a boba instead
const SHIELD_TIME = 4; // seconds a boba shield lasts
const SAVE_KEY = "bigGameRunBest";

const DAY = {
  farHill: "#a9cf9a",
  hill: "#7fb86a",
  hillShade: "#5f9a52",
  tower: "#e6d1a8",
  towerShade: "#c4a77f",
  dome: "#c0504a",
  grass: "#4f9a4a",
  ground: "#ead2a0",
  groundSpeck: "#c9a46a",
  groundLine: "#5a3e2b",
  dust: "#d8bb84",
  text: PALETTE.K,
};

const NIGHT = {
  farHill: "#34466a",
  hill: "#27395a",
  hillShade: "#1d2b48",
  tower: "#8c8aa8",
  towerShade: "#62607e",
  dome: "#7a3448",
  grass: "#24503e",
  ground: "#5e5672",
  groundSpeck: "#463f5a",
  groundLine: "#1a1022",
  dust: "#7c7290",
  text: PALETTE.W,
};

const DAY_SKY = ["#7ec8e3", "#9fd6e8", "#c3e5ea", "#e9eedd"];
const NIGHT_SKY = ["#121838", "#1a234c", "#25305f", "#343e74"];

// The colors in use right now, somewhere between DAY and NIGHT.
const COLORS = { ...DAY, sun: "#fff1b8", moon: PALETTE.Z, title: PALETTE.R };

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
let state = "title"; // "title", "playing", or "over"
let time = 0;
let best = load(SAVE_KEY, 0);

const cardy = { x: 28, y: GROUND_Y, vy: 0, onGround: true, ducking: false, canDoubleJump: false };

let speed = START_SPEED;
let distance = 0;
let bonus = 0; // points from acorns
let score = 0; // distance points + bonus
let newBest = false;
let obstacles = [];
let untilNextObstacle = 0;
let items = []; // acorns and boba
let popups = []; // "+25" and friends
let dust = []; // dust, sparkles, and shield bursts
let dustTimer = 0;
let flashTimer = 0; // score blinks after every 100 points
let shakeTimer = 0;
let overTimer = 0;
let shieldTimer = 0;
let graceTimer = 0; // short safe time after the shield breaks
let nightAmount = 0; // 0 is day, 1 is night
let scenery = 0; // how far the background has scrolled

// Counters a browser tool can read to confirm features work.
let acornsCollected = 0;
let doubleJumps = 0;
let shieldSaves = 0;
let bearsSpawned = 0;

const clouds = [
  { x: 30, y: 26 },
  { x: 130, y: 44 },
  { x: 210, y: 18 },
];

function startRun() {
  state = "playing";
  speed = START_SPEED;
  distance = 0;
  bonus = 0;
  score = 0;
  newBest = false;
  obstacles = [];
  untilNextObstacle = 120;
  items = [];
  popups = [];
  dust = [];
  flashTimer = 0;
  shieldTimer = 0;
  graceTimer = 0;
  cardy.y = GROUND_Y;
  cardy.vy = 0;
  cardy.canDoubleJump = false;
}

function endRun() {
  state = "over";
  overTimer = 0;
  shakeTimer = 0.3;
  shieldTimer = 0;
  beep(220, 0.35, { type: "sawtooth", volume: 0.05, slideTo: 60 });
  if (score > best) {
    best = score;
    newBest = true;
    save(SAVE_KEY, best);
  }
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
function jumpPressed() {
  return input.wasPressed("Space") || input.wasPressed("ArrowUp") || input.pointer.pressed;
}

function jumpHeld() {
  return input.isDown("Space") || input.isDown("ArrowUp") || input.pointer.down;
}

function duckHeld() {
  return input.isDown("ArrowDown");
}

// ---------------------------------------------------------------------------
// Obstacles and pickups
// ---------------------------------------------------------------------------
function addObstacle(sprite, x, y, options = {}) {
  const { width, height } = spriteSize(sprite);
  obstacles.push({ sprite, x, y, width, height, ...options });
}

function spawnObstacles() {
  const kinds = ["cone", "cone", "cones", "bike"];
  if (score >= BIRDS_AT) kinds.push("bird", "bird");
  if (score >= BEARS_AT) kinds.push("bear", "bear");
  const kind = pick(kinds);
  const x = screen.width + 4;
  let groupWidth = 0;

  if (kind === "cone") {
    addObstacle("cone", x, GROUND_Y - 11);
    groupWidth = 11;
  } else if (kind === "cones") {
    const count = pick([2, 3]);
    for (let i = 0; i < count; i++) addObstacle("cone", x + i * 10, GROUND_Y - 11);
    groupWidth = count * 10 + 1;
  } else if (kind === "bike") {
    addObstacle("bike", x, GROUND_Y - 14);
    groupWidth = 26;
  } else if (kind === "bird") {
    // Low birds must be jumped, middle birds can be ducked, high birds pass overhead.
    const height = pick([16, 34, 52]);
    addObstacle("birdUp", x, GROUND_Y - height, { bird: true, extraSpeed: 15 });
    groupWidth = 16;
  } else if (kind === "bear") {
    // Bears walk faster than the world scrolls, so they start farther right
    // and still reach Cardy as if they were a normal obstacle at x.
    const lead = ((x - cardy.x) * BEAR_EXTRA_SPEED) / speed;
    addObstacle("bearWalk1", x + lead, GROUND_Y - 16, { bear: true, extraSpeed: BEAR_EXTRA_SPEED });
    groupWidth = 20;
    bearsSpawned++;
  }

  // Leave enough room to land and react, more at higher speeds.
  const gap = rand(1, 1.7) * (speed * 0.75 + 70);
  untilNextObstacle = groupWidth + gap;

  // Pickups float in the middle of the gap, so they never sit on an obstacle.
  const itemX = x + groupWidth + gap / 2;
  const hasBoba = items.some((item) => item.kind === "boba");
  if (score >= 100 && shieldTimer <= 0 && !hasBoba && Math.random() < BOBA_CHANCE) {
    addItem("boba", itemX, 34);
  } else if (Math.random() < ACORN_CHANCE) {
    // From low to high: grab while running, jump, jump high, double jump.
    addItem("acorn", itemX, pick([8, 34, 60, 88]));
  }
}

// height is how far the bottom of the pickup floats above the ground.
function addItem(kind, x, height) {
  const { width, height: h } = spriteSize(kind);
  items.push({ kind, x, y: GROUND_Y - height - h, width, height: h, phase: rand(0, 6) });
}

function obstacleHitbox(o) {
  if (o.bird) return { x: o.x + 1, y: o.y + 3, width: 14, height: 5 };
  return { x: o.x + 2, y: o.y + 2, width: o.width - 4, height: o.height - 2 };
}

function cardyHitbox() {
  if (cardy.ducking) return { x: cardy.x + 4, y: cardy.y - 21, width: 20, height: 19 };
  return { x: cardy.x + 6, y: cardy.y - 30, width: 16, height: 28 };
}

function collect(item) {
  item.gone = true;
  if (item.kind === "acorn") {
    bonus += ACORN_POINTS;
    acornsCollected++;
    addPopup(`+${ACORN_POINTS}`, item.x + item.width / 2, item.y - 4);
    beep(988, 0.06);
    setTimeout(() => beep(1480, 0.08), 60);
  } else if (item.kind === "boba") {
    shieldTimer = SHIELD_TIME;
    addPopup("SHIELD!", item.x + item.width / 2, item.y - 4);
    beep(392, 0.3, { type: "triangle", volume: 0.06, slideTo: 1175 });
  }
}

function addPopup(text, x, y) {
  popups.push({ text, x, y, life: 0.8 });
}

// The shield (or the safe time right after it breaks) smashes what Cardy hits.
function smash(hits) {
  for (const o of hits) {
    o.gone = true;
    burst(o.x + o.width / 2, o.y + o.height / 2, 12, [PALETTE.S, PALETTE.W]);
  }
  if (shieldTimer > 0) {
    shieldTimer = 0;
    graceTimer = 0.6;
    shieldSaves++;
    addPopup("POW!", cardy.x + 14, cardy.y - 40);
    beep(160, 0.2, { type: "square", volume: 0.06, slideTo: 640 });
  }
}

// ---------------------------------------------------------------------------
// Update: runs every frame. dt is the seconds since the last frame.
// ---------------------------------------------------------------------------
function update(dt) {
  time += dt;
  flashTimer = Math.max(0, flashTimer - dt);
  shakeTimer = Math.max(0, shakeTimer - dt);

  if (state === "title") {
    scenery += 8 * dt;
    if (jumpPressed()) {
      startRun();
      jump();
    }
  } else if (state === "playing") {
    updateRun(dt);
  } else if (state === "over") {
    overTimer += dt;
    if (overTimer > 0.6 && jumpPressed()) startRun();
  }

  // Day and night swap every DAY_LENGTH points.
  const night = Math.floor(score / DAY_LENGTH) % 2;
  const step = dt / NIGHT_FADE;
  nightAmount = night ? Math.min(1, nightAmount + step) : Math.max(0, nightAmount - step);
  updatePalette();

  for (const cloud of clouds) {
    cloud.x -= (state === "playing" ? speed * 0.15 : 6) * dt;
    if (cloud.x < -24) {
      cloud.x = screen.width + rand(0, 60);
      cloud.y = rand(12, 56);
    }
  }

  for (const d of dust) {
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    d.life -= dt;
  }
  dust = dust.filter((d) => d.life > 0);

  for (const p of popups) {
    p.y -= 20 * dt;
    p.life -= dt;
  }
  popups = popups.filter((p) => p.life > 0);
}

function jump() {
  cardy.vy = -JUMP_SPEED;
  cardy.onGround = false;
  cardy.canDoubleJump = true;
  beep(520, 0.12, { slideTo: 900 });
}

function doubleJump() {
  cardy.vy = -DOUBLE_JUMP_SPEED;
  cardy.canDoubleJump = false;
  doubleJumps++;
  burst(cardy.x + 14, cardy.y - 2, 8, [PALETTE.W, PALETTE.Y]);
  beep(780, 0.1, { type: "triangle", volume: 0.06, slideTo: 1560 });
}

function updateRun(dt) {
  speed = Math.min(MAX_SPEED, speed + SPEED_UP * dt);
  distance += speed * dt;
  scenery += speed * dt;

  const newScore = Math.floor(distance / 10) + bonus;
  if (Math.floor(newScore / 100) > Math.floor(score / 100)) {
    flashTimer = 0.9;
    beep(880, 0.08);
    setTimeout(() => beep(1320, 0.12), 90);
  }
  score = newScore;
  shieldTimer = Math.max(0, shieldTimer - dt);
  graceTimer = Math.max(0, graceTimer - dt);

  // Cardy: jump, one extra jump in the air, short hop when the button is
  // released early, fast fall when ducking.
  if (jumpPressed() && !duckHeld()) {
    if (cardy.onGround) jump();
    else if (cardy.canDoubleJump) doubleJump();
  }
  if (!cardy.onGround && !jumpHeld() && cardy.vy < -JUMP_SPEED * 0.75) cardy.vy = -JUMP_SPEED * 0.75;
  const gravity = duckHeld() && !cardy.onGround ? GRAVITY * 3 : GRAVITY;
  cardy.vy += gravity * dt;
  cardy.y += cardy.vy * dt;
  if (cardy.y >= GROUND_Y) {
    if (!cardy.onGround) puffDust(6);
    cardy.y = GROUND_Y;
    cardy.vy = 0;
    cardy.onGround = true;
    cardy.canDoubleJump = false;
  }
  cardy.ducking = cardy.onGround && duckHeld();

  dustTimer -= dt;
  if (cardy.onGround && dustTimer <= 0) {
    puffDust(1);
    dustTimer = 0.1;
  }

  // Obstacles scroll left with the world. Birds and bears move a little faster.
  untilNextObstacle -= speed * dt;
  if (untilNextObstacle <= 0) spawnObstacles();
  for (const o of obstacles) {
    o.x -= (speed + (o.extraSpeed || 0)) * dt;
    if (o.bird) o.sprite = Math.floor(time * 6) % 2 ? "birdUp" : "birdDown";
    if (o.bear) o.sprite = Math.floor(time * 8) % 2 ? "bearWalk1" : "bearWalk2";
  }
  for (const item of items) item.x -= speed * dt;

  const me = cardyHitbox();
  for (const item of items) if (overlaps(me, item)) collect(item);
  items = items.filter((item) => !item.gone && item.x > -20);

  const hits = obstacles.filter((o) => overlaps(me, obstacleHitbox(o)));
  if (hits.length > 0) {
    if (shieldTimer > 0 || graceTimer > 0) smash(hits);
    else endRun();
  }
  obstacles = obstacles.filter((o) => !o.gone && o.x > -40);
}

function puffDust(count) {
  for (let i = 0; i < count; i++) {
    dust.push({
      x: cardy.x + 8 + rand(-2, 4),
      y: GROUND_Y - 1,
      vx: -rand(20, 60),
      vy: -rand(5, 30),
      life: rand(0.2, 0.4),
    });
  }
}

// A ring of 1-pixel sparks flying out from (x, y).
function burst(x, y, count, colors) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    dust.push({
      x,
      y,
      vx: Math.cos(angle) * 70,
      vy: Math.sin(angle) * 70,
      life: 0.3,
      size: 1,
      color: colors[i % colors.length],
    });
  }
}

// ---------------------------------------------------------------------------
// Day and night
// ---------------------------------------------------------------------------
let paletteStep = -1;

function updatePalette() {
  const step = Math.round(nightAmount * FADE_STEPS);
  if (step === paletteStep) return;
  paletteStep = step;
  for (const key in DAY) COLORS[key] = mixColor(DAY[key], NIGHT[key], step / FADE_STEPS);
}

function mixColor(a, b, t) {
  const channel = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const mixed = [0, 1, 2].map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t));
  return `rgb(${mixed.join(",")})`;
}

// ---------------------------------------------------------------------------
// Draw: runs every frame after update().
// ---------------------------------------------------------------------------
function draw() {
  ctx.save();
  if (shakeTimer > 0) ctx.translate(Math.round(rand(-2, 2)), Math.round(rand(-2, 2)));

  const night = paletteStep / FADE_STEPS;
  drawSky(night);
  ctx.globalAlpha = 1 - night * 0.6;
  for (const cloud of clouds) drawSprite("cloud", cloud.x, cloud.y);
  ctx.globalAlpha = 1;
  drawHills(scenery * 0.05, 120, 10, COLORS.farHill);
  drawHooverTower(screen.width + 40 - ((scenery * 0.08 + 120) % (screen.width + 120)), 132);
  drawHills(scenery * 0.2, 146, 8, COLORS.hill, COLORS.hillShade);
  drawGround();

  for (const item of items) drawSprite(item.kind, item.x, item.y + Math.round(Math.sin(time * 5 + item.phase) * 1.5));
  for (const o of obstacles) drawSprite(o.sprite, o.x, o.y);
  for (const d of dust) rect(d.x, d.y, d.size || 2, 1, d.color || COLORS.dust);
  drawCardy();
  for (const p of popups) {
    drawText(p.text, p.x + 1, p.y + 1, { color: PALETTE.K, align: "center" });
    drawText(p.text, p.x, p.y, { color: PALETTE.Y, align: "center" });
  }

  ctx.restore();
  drawHud();
}

function drawCardy() {
  let sprite = "cardyRun1";
  if (state === "title") sprite = Math.floor(time * 2) % 2 ? "cardyRun1" : "cardyJump";
  else if (state === "over") sprite = "cardyJump";
  else if (!cardy.onGround) sprite = "cardyJump";
  else if (cardy.ducking) sprite = "cardyDuck";
  else sprite = Math.floor(distance / 14) % 2 ? "cardyRun1" : "cardyRun2";
  const x = cardy.x;
  const y = cardy.y - spriteSize(sprite).height;

  // Blink while safe after the shield breaks.
  if (graceTimer > 0 && Math.floor(time * 16) % 2 === 0) return;

  // Shield: a 2-pixel glow around Cardy that blinks when it's about to run out.
  if (shieldTimer > 0 && (shieldTimer > 1 || Math.floor(time * 10) % 2 === 0)) {
    const outer = glowSprite(sprite, "s");
    for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      drawSprite(outer, x + dx, y + dy);
    }
    const inner = glowSprite(sprite, "S");
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) drawSprite(inner, x + dx, y + dy);
  }
  drawSprite(sprite, x, y);
}

// A solid copy of a sprite in one palette color, made the first time it's needed.
function glowSprite(name, color) {
  const glow = `${name}Glow${color}`;
  if (!SPRITES[glow]) SPRITES[glow] = SPRITES[name].map((row) => row.replace(/[^.]/g, color));
  return glow;
}

// Both skies are painted once and reused. At dusk the night sky is drawn
// over the day sky, a little more each step.
let daySky = null;
let nightSky = null;

function drawSky(night) {
  if (!daySky) {
    daySky = paintSky(DAY_SKY);
    nightSky = paintSky(NIGHT_SKY);
    const g = daySky.getContext("2d");
    g.fillStyle = COLORS.sun;
    fillCircle(g, 206, 34, 11);
    const n = nightSky.getContext("2d");
    paintStars(n);
    // A crescent moon: a full circle with a sky-colored circle bitten out.
    n.fillStyle = COLORS.moon;
    fillCircle(n, 206, 32, 9);
    n.fillStyle = NIGHT_SKY[0];
    fillCircle(n, 211, 29, 8);
  }
  if (night < 1) ctx.drawImage(daySky, 0, 0);
  if (night > 0) {
    ctx.globalAlpha = night;
    ctx.drawImage(nightSky, 0, 0);
    ctx.globalAlpha = 1;
  }
}

function paintSky(colors) {
  const image = document.createElement("canvas");
  image.width = screen.width;
  image.height = GROUND_Y;
  const g = image.getContext("2d");
  const band = Math.ceil(GROUND_Y / colors.length);
  colors.forEach((color, i) => {
    g.fillStyle = color;
    g.fillRect(0, i * band, screen.width, band);
    // A checkerboard row blends each band into the next, the old-school way.
    if (i > 0) {
      g.fillStyle = colors[i - 1];
      for (let x = 0; x < screen.width; x += 2) g.fillRect(x, i * band, 1, 1);
      for (let x = 1; x < screen.width; x += 2) g.fillRect(x, i * band + 2, 1, 1);
    }
  });
  return image;
}

function paintStars(g) {
  for (let i = 0; i < 46; i++) {
    // Scattered with a hash instead of Math.random, so the stars never move.
    let n = Math.imul(i + 1, 2654435761);
    n = Math.imul(n ^ (n >>> 15), 2246822507) >>> 0;
    n = (n ^ (n >>> 13)) >>> 0;
    const x = (n >>> 8) % screen.width;
    const y = 4 + ((n >>> 20) % 104);
    if (Math.abs(x - 206) < 16 && Math.abs(y - 32) < 16) continue;
    g.fillStyle = i % 3 ? "#9aa8d8" : PALETTE.W;
    g.fillRect(x, y, 1, 1);
    // Every few stars is a bright one with a little plus shape.
    if (i % 7 === 0) {
      g.fillRect(x - 1, y, 3, 1);
      g.fillRect(x, y - 1, 1, 3);
    }
  }
}

function fillCircle(g, cx, cy, r) {
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.round(Math.sqrt(r * r - dy * dy));
    g.fillRect(cx - half, cy + dy, half * 2, 1);
  }
}

function drawHills(offset, baseY, size, color, shade) {
  for (let x = 0; x < screen.width; x++) {
    const wx = x + offset;
    const top = Math.round(baseY - size * (Math.sin(wx / 37) + Math.sin(wx / 23 + 1.3) * 0.6 + 1.6));
    rect(x, top, 1, GROUND_Y - top, color);
    if (shade) rect(x, top, 1, 2, shade);
  }
}

// Hoover Tower, drawn with rectangles.
function drawHooverTower(x, groundY) {
  const w = 14;
  rect(x - 4, groundY - 6, w + 8, 6, COLORS.towerShade);
  rect(x, groundY - 46, w, 40, COLORS.tower);
  rect(x + w - 3, groundY - 46, 3, 40, COLORS.towerShade);
  rect(x - 1, groundY - 50, w + 2, 4, COLORS.towerShade);
  for (let i = 0; i < 3; i++) rect(x + 2 + i * 4, groundY - 46 + 2, 2, 5, COLORS.towerShade);
  rect(x + 1, groundY - 53, w - 2, 3, COLORS.tower);
  rect(x + 3, groundY - 56, w - 6, 3, COLORS.dome);
  rect(x + 5, groundY - 58, w - 10, 2, COLORS.dome);
  rect(x + 6, groundY - 61, 2, 3, COLORS.towerShade);
}

function drawGround() {
  rect(0, GROUND_Y, screen.width, screen.height - GROUND_Y, COLORS.ground);
  rect(0, GROUND_Y, screen.width, 1, COLORS.groundLine);
  rect(0, GROUND_Y + 1, screen.width, 2, COLORS.grass);
  // Pebbles at fixed spots in the world, so they scroll with the ground.
  const tile = 8;
  for (let sx = -(distance % tile); sx < screen.width; sx += tile) {
    const n = Math.imul(Math.floor((distance + sx) / tile) + 1, 2654435761) >>> 0;
    if (n % 3 === 0) rect(sx + (n % 5), GROUND_Y + 6 + ((n >>> 4) % 18), 2, 1, COLORS.groundSpeck);
    if (n % 7 === 0) rect(sx + ((n >>> 2) % 6), GROUND_Y + 4 + ((n >>> 8) % 20), 1, 1, COLORS.groundLine);
  }
}

function drawHud() {
  const pad = (n) => String(n).padStart(5, "0");
  const blink = flashTimer > 0 && Math.floor(flashTimer * 8) % 2 === 0;
  if (!blink) drawText(pad(score), screen.width - 8, 8, { color: COLORS.text, align: "right" });
  drawText(`HI ${pad(best)}`, screen.width - 46, 8, { color: COLORS.text, align: "right" });
  if (muted) drawText("SOUND OFF", 8, 8, { color: COLORS.text });

  // Shield timer bar, top left.
  if (shieldTimer > 0) {
    const barY = muted ? 18 : 8;
    rect(8, barY, 42, 7, PALETTE.K);
    rect(9, barY + 1, Math.ceil((40 * shieldTimer) / SHIELD_TIME), 5, PALETTE.S);
  }

  const center = screen.width / 2;
  const blinkOn = Math.floor(time * 2) % 2 === 0;
  if (state === "title") {
    drawText("BIG GAME RUN", center + 1, 45, { color: COLORS.text, scale: 3, align: "center" });
    drawText("BIG GAME RUN", center, 44, { color: COLORS.title, scale: 3, align: "center" });
    if (blinkOn) drawText("PRESS SPACE OR TAP", center, 80, { color: COLORS.text, align: "center" });
    drawText("JUMP AGAIN IN THE AIR", center, 94, { color: COLORS.text, align: "center" });
    drawText("DOWN ARROW TO DUCK", center, 106, { color: COLORS.text, align: "center" });
  } else if (state === "over") {
    drawText("GAME OVER", center + 1, 57, { color: COLORS.text, scale: 2, align: "center" });
    drawText("GAME OVER", center, 56, { color: COLORS.title, scale: 2, align: "center" });
    if (newBest) drawText("NEW HIGH SCORE!", center, 78, { color: COLORS.title, align: "center" });
    if (overTimer > 0.6 && blinkOn) drawText("PRESS SPACE TO RUN AGAIN", center, 92, { color: COLORS.text, align: "center" });
  }
}
