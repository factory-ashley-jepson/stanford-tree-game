// Tree Run: a retro runner starring Cardy, the Stanford Tree.
// Jump over cones and bikes, duck under birds, and beat your high score.
//
// This is the whole game. The art is in sprites.js and the helpers
// (drawSprite, drawText, input, beep, ...) are in engine.js.
// Make it yours: change the numbers below, add obstacles, add power-ups.

// ---------------------------------------------------------------------------
// Tuning: try changing these first.
// ---------------------------------------------------------------------------
const GROUND_Y = 168; // y of the ground line, in screen pixels
const GRAVITY = 1100; // pixels per second per second
const JUMP_SPEED = 330; // how hard Cardy jumps
const START_SPEED = 110; // how fast the world scrolls at the start
const MAX_SPEED = 290;
const SPEED_UP = 3.5; // speed gained per second
const BIRDS_AT = 200; // score when birds start showing up

const COLORS = {
  sky: ["#7ec8e3", "#9fd6e8", "#c3e5ea", "#e9eedd"],
  sun: "#fff1b8",
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
  title: PALETTE.R,
};

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
let state = "title"; // "title", "playing", or "over"
let time = 0;
let best = load("treeRunBest", 0);

const cardy = { x: 28, y: GROUND_Y, vy: 0, onGround: true, ducking: false };

let speed = START_SPEED;
let distance = 0;
let score = 0;
let newBest = false;
let obstacles = [];
let untilNextObstacle = 0;
let dust = [];
let dustTimer = 0;
let flashTimer = 0; // score blinks after every 100 points
let shakeTimer = 0;
let overTimer = 0;
let scenery = 0; // how far the background has scrolled

const clouds = [
  { x: 30, y: 26 },
  { x: 130, y: 44 },
  { x: 210, y: 18 },
];

function startRun() {
  state = "playing";
  speed = START_SPEED;
  distance = 0;
  score = 0;
  newBest = false;
  obstacles = [];
  untilNextObstacle = 120;
  dust = [];
  flashTimer = 0;
  cardy.y = GROUND_Y;
  cardy.vy = 0;
}

function endRun() {
  state = "over";
  overTimer = 0;
  shakeTimer = 0.3;
  beep(220, 0.35, { type: "sawtooth", volume: 0.05, slideTo: 60 });
  if (score > best) {
    best = score;
    newBest = true;
    save("treeRunBest", best);
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
// Obstacles
// ---------------------------------------------------------------------------
function addObstacle(sprite, x, y, options = {}) {
  const { width, height } = spriteSize(sprite);
  obstacles.push({ sprite, x, y, width, height, ...options });
}

function spawnObstacles() {
  const kinds = ["cone", "cone", "cones", "bike"];
  if (score >= BIRDS_AT) kinds.push("bird", "bird");
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
  }

  // Leave enough room to land and react, more at higher speeds.
  untilNextObstacle = groupWidth + rand(1, 1.7) * (speed * 0.75 + 70);
}

function obstacleHitbox(o) {
  if (o.bird) return { x: o.x + 1, y: o.y + 3, width: 14, height: 5 };
  return { x: o.x + 2, y: o.y + 2, width: o.width - 4, height: o.height - 2 };
}

function cardyHitbox() {
  if (cardy.ducking) return { x: cardy.x + 4, y: cardy.y - 21, width: 20, height: 19 };
  return { x: cardy.x + 6, y: cardy.y - 30, width: 16, height: 28 };
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
}

function jump() {
  cardy.vy = -JUMP_SPEED;
  cardy.onGround = false;
  beep(520, 0.12, { slideTo: 900 });
}

function updateRun(dt) {
  speed = Math.min(MAX_SPEED, speed + SPEED_UP * dt);
  distance += speed * dt;
  scenery += speed * dt;

  const newScore = Math.floor(distance / 10);
  if (Math.floor(newScore / 100) > Math.floor(score / 100)) {
    flashTimer = 0.9;
    beep(880, 0.08);
    setTimeout(() => beep(1320, 0.12), 90);
  }
  score = newScore;

  // Cardy: jump, short hop when the button is released early, fast fall when ducking.
  if (cardy.onGround && jumpPressed() && !duckHeld()) jump();
  if (!cardy.onGround && !jumpHeld() && cardy.vy < -JUMP_SPEED * 0.75) cardy.vy = -JUMP_SPEED * 0.75;
  const gravity = duckHeld() && !cardy.onGround ? GRAVITY * 3 : GRAVITY;
  cardy.vy += gravity * dt;
  cardy.y += cardy.vy * dt;
  if (cardy.y >= GROUND_Y) {
    if (!cardy.onGround) puffDust(6);
    cardy.y = GROUND_Y;
    cardy.vy = 0;
    cardy.onGround = true;
  }
  cardy.ducking = cardy.onGround && duckHeld();

  dustTimer -= dt;
  if (cardy.onGround && dustTimer <= 0) {
    puffDust(1);
    dustTimer = 0.1;
  }

  // Obstacles scroll left with the world. Birds fly a little faster.
  untilNextObstacle -= speed * dt;
  if (untilNextObstacle <= 0) spawnObstacles();
  for (const o of obstacles) {
    o.x -= (speed + (o.extraSpeed || 0)) * dt;
    if (o.bird) o.sprite = Math.floor(time * 6) % 2 ? "birdUp" : "birdDown";
  }
  obstacles = obstacles.filter((o) => o.x > -40);

  const me = cardyHitbox();
  if (obstacles.some((o) => overlaps(me, obstacleHitbox(o)))) endRun();
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

// ---------------------------------------------------------------------------
// Draw: runs every frame after update().
// ---------------------------------------------------------------------------
function draw() {
  ctx.save();
  if (shakeTimer > 0) ctx.translate(Math.round(rand(-2, 2)), Math.round(rand(-2, 2)));

  drawSky();
  for (const cloud of clouds) drawSprite("cloud", cloud.x, cloud.y);
  drawHills(scenery * 0.05, 120, 10, COLORS.farHill);
  drawHooverTower(screen.width + 40 - ((scenery * 0.08 + 120) % (screen.width + 120)), 132);
  drawHills(scenery * 0.2, 146, 8, COLORS.hill, COLORS.hillShade);
  drawGround();

  for (const o of obstacles) drawSprite(o.sprite, o.x, o.y);
  for (const d of dust) rect(d.x, d.y, 2, 1, COLORS.dust);
  drawCardy();

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
  drawSprite(sprite, cardy.x, cardy.y - spriteSize(sprite).height);
}

// The sky is the same every frame, so it is painted once and reused.
let skyImage = null;

function drawSky() {
  if (!skyImage) {
    skyImage = document.createElement("canvas");
    skyImage.width = screen.width;
    skyImage.height = GROUND_Y;
    const g = skyImage.getContext("2d");
    const band = Math.ceil(GROUND_Y / COLORS.sky.length);
    COLORS.sky.forEach((color, i) => {
      g.fillStyle = color;
      g.fillRect(0, i * band, screen.width, band);
      // A checkerboard row blends each band into the next, the old-school way.
      if (i > 0) {
        g.fillStyle = COLORS.sky[i - 1];
        for (let x = 0; x < screen.width; x += 2) g.fillRect(x, i * band, 1, 1);
        for (let x = 1; x < screen.width; x += 2) g.fillRect(x, i * band + 2, 1, 1);
      }
    });
    g.fillStyle = COLORS.sun;
    const sun = { x: 206, y: 34, r: 11 };
    for (let dy = -sun.r; dy <= sun.r; dy++) {
      const half = Math.round(Math.sqrt(sun.r * sun.r - dy * dy));
      g.fillRect(sun.x - half, sun.y + dy, half * 2, 1);
    }
  }
  ctx.drawImage(skyImage, 0, 0);
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

  const center = screen.width / 2;
  const blinkOn = Math.floor(time * 2) % 2 === 0;
  if (state === "title") {
    drawText("TREE RUN", center + 1, 45, { color: COLORS.text, scale: 3, align: "center" });
    drawText("TREE RUN", center, 44, { color: COLORS.title, scale: 3, align: "center" });
    if (blinkOn) drawText("PRESS SPACE OR TAP", center, 80, { color: COLORS.text, align: "center" });
    drawText("DOWN ARROW TO DUCK", center, 94, { color: COLORS.text, align: "center" });
  } else if (state === "over") {
    drawText("GAME OVER", center + 1, 57, { color: COLORS.text, scale: 2, align: "center" });
    drawText("GAME OVER", center, 56, { color: COLORS.title, scale: 2, align: "center" });
    if (newBest) drawText("NEW HIGH SCORE!", center, 78, { color: COLORS.title, align: "center" });
    if (overTimer > 0.6 && blinkOn) drawText("PRESS SPACE TO RUN AGAIN", center, 92, { color: COLORS.text, align: "center" });
  }
}
