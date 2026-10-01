// Pixel art for the game. Each sprite is a list of rows; each letter is one pixel.
// "." is transparent. Every other letter is a color from PALETTE.
// Edit a letter to recolor a pixel, or add a new sprite and draw it with
// drawSprite("name", x, y) in game.js.

const PALETTE = {
  K: "#1a1022", // outline
  B: "#1a1022", // glasses
  W: "#f6f2e6", // white
  R: "#c41e28", // Stanford cardinal
  r: "#801020", // cardinal shadow
  P: "#c41e28", // Cardy's legs
  G: "#268052", // pine green
  L: "#60ba60", // pine highlight
  D: "#12523a", // pine shadow
  M: "#d64646", // mouth
  O: "#f08a24", // cone orange
  o: "#b85c14", // cone shadow
  N: "#3a2f55", // bird
  n: "#6a5a90", // bird wing
  Y: "#f2b632", // beak
  C: "#c9dce8", // cloud shade
  A: "#7a4a22", // acorn cap
  a: "#5a3416", // acorn cap shadow
  U: "#d88a3c", // acorn nut
  u: "#a8602a", // acorn nut shadow
  T: "#ecc89c", // milk tea
  t: "#c99a6a", // milk tea shadow
  p: "#3a2418", // boba pearls
  S: "#8ff0ff", // shield glow
  s: "#1f9fb4", // shield glow edge
  F: "#e0a530", // Cal bear fur (gold)
  f: "#a8741c", // fur shadow
  V: "#23336a", // Cal navy
  v: "#141e44", // navy shadow
  Z: "#ffe9a8", // moon
};

const SPRITES = {
  // Cardy, 28x32. Two running frames, a jump frame, and a duck frame.
  cardyRun1: [
    ".........KKRRRRRRKK.........",
    "........KRRRWWWRRrrK........",
    ".......KRRRRWRRRRRrrK.......",
    ".......KRRRRWWWRRRrrK.......",
    ".......KRRRRRRWRRRrrK.......",
    ".......KRRRRWWWRRRrrK.......",
    "......KKRRRRRRRRRRrrKK......",
    ".....KrrrrrrrrrrrrrrrrK.....",
    "......KLLGGGGGGGGGGDDK......",
    ".....KLBBBBBBBBBBBBBBDK.....",
    "....KLLBWWWWBGGBWWWWBDDK....",
    ".....KLBWWBWBGGBWWBWBDK.....",
    "....KLLBWWBWBGGBWWBWBDDK....",
    "...KLGGBBBBBBGGBBBBBBGDDK...",
    "..KLLGGGGGGGGGGGGGGGGGGDDK..",
    "...KKLDDDGKKKKKKKKGDDDDKK...",
    "...KLLGGGDKWWWWWWKDGGGDDK...",
    "..KLGGGGGGGKMMMMKGGGGGGDDK..",
    ".KLLGGGGGGGGKKKKGGGGGGGGDDK.",
    "KLGGGGGGGGGGGGGGGGGGGGGGGDDK",
    ".KKKLDDDGGGGGGGGGGGGDDDDKKK.",
    "..KLGGGGDGGGGGGGGGGDGGGDDK..",
    ".KLLGGGGGGGGGGGGGGGGGGGGDDK.",
    "KLGGGGGGGGGGGGGGGGGGGGGGGDDK",
    "KLLGGGGGGGGGGGGGGGGGGGGGGDDK",
    ".KLDDDGGGGGGGGGGGGGGGGDDDDK.",
    "..KLDDDGGGGGGGGGGGGGGDDDDK..",
    "...KKKKDKKPPKKKKPPKKDKKKK...",
    ".......K.KPPK..KPPKKK.......",
    "........KKPPK.KWWWWWK.......",
    ".......KWWWWWK.KKKKK........",
    "........KKKKK...............",
  ],
  cardyRun2: [
    ".........KKRRRRRRKK.........",
    "........KRRRWWWRRrrK........",
    ".......KRRRRWRRRRRrrK.......",
    ".......KRRRRWWWRRRrrK.......",
    ".......KRRRRRRWRRRrrK.......",
    ".......KRRRRWWWRRRrrK.......",
    "......KKRRRRRRRRRRrrKK......",
    ".....KrrrrrrrrrrrrrrrrK.....",
    "......KLLGGGGGGGGGGDDK......",
    ".....KLBBBBBBBBBBBBBBDK.....",
    "....KLLBWWWWBGGBWWWWBDDK....",
    ".....KLBWWBWBGGBWWBWBDK.....",
    "....KLLBWWBWBGGBWWBWBDDK....",
    "...KLGGBBBBBBGGBBBBBBGDDK...",
    "..KLLGGGGGGGGGGGGGGGGGGDDK..",
    "...KKLDDDGKKKKKKKKGDDDDKK...",
    "...KLLGGGDKWWWWWWKDGGGDDK...",
    "..KLGGGGGGGKMMMMKGGGGGGDDK..",
    ".KLLGGGGGGGGKKKKGGGGGGGGDDK.",
    "KLGGGGGGGGGGGGGGGGGGGGGGGDDK",
    ".KKKLDDDGGGGGGGGGGGGDDDDKKK.",
    "..KLGGGGDGGGGGGGGGGDGGGDDK..",
    ".KLLGGGGGGGGGGGGGGGGGGGGDDK.",
    "KLGGGGGGGGGGGGGGGGGGGGGGGDDK",
    "KLLGGGGGGGGGGGGGGGGGGGGGGDDK",
    ".KLDDDGGGGGGGGGGGGGGGGDDDDK.",
    "..KLDDDGGGGGGGGGGGGGGDDDDK..",
    "...KKKKDKKPPKKKKPPKKDKKKK...",
    ".......KKKPPK..KPPK.K.......",
    ".......KWWWWWK.KPPKK........",
    "........KKKKK.KWWWWWK.......",
    "...............KKKKK........",
  ],
  cardyJump: [
    ".........KKRRRRRRKK.........",
    "........KRRRWWWRRrrK........",
    ".......KRRRRWRRRRRrrK.......",
    ".......KRRRRWWWRRRrrK.......",
    ".......KRRRRRRWRRRrrK.......",
    ".......KRRRRWWWRRRrrK.......",
    "......KKRRRRRRRRRRrrKK......",
    ".....KrrrrrrrrrrrrrrrrK.....",
    "......KLLGGGGGGGGGGDDK......",
    ".....KLBBBBBBBBBBBBBBDK.....",
    "....KLLBWWWWBGGBWWWWBDDK....",
    ".....KLBWWBWBGGBWWBWBDK.....",
    "....KLLBWWBWBGGBWWBWBDDK....",
    "...KLGGBBBBBBGGBBBBBBGDDK...",
    "..KLLGGGGGGGGGGGGGGGGGGDDK..",
    "...KKLDDDGKKKKKKKKGDDDDKK...",
    "...KLLGGGDKWWWWWWKDGGGDDK...",
    "..KLGGGGGGGKMMMMKGGGGGGDDK..",
    ".KLLGGGGGGGGKKKKGGGGGGGGDDK.",
    "KLGGGGGGGGGGGGGGGGGGGGGGGDDK",
    ".KKKLDDDGGGGGGGGGGGGDDDDKKK.",
    "..KLGGGGDGGGGGGGGGGDGGGDDK..",
    ".KLLGGGGGGGGGGGGGGGGGGGGDDK.",
    "KLGGGGGGGGGGGGGGGGGGGGGGGDDK",
    "KLLGGGGGGGGGGGGGGGGGGGGGGDDK",
    ".KLDDDGGGGGGGGGGGGGGGGDDDDK.",
    "..KLDDDGGGGGGGGGGGGGGDDDDK..",
    "...KKKKDKKPPKKKKPPKKDKKKK...",
    ".......KKKPPK..KPPKKK.......",
    ".......KWWWWWKKWWWWWK.......",
    "........KKKKK..KKKKK........",
  ],
  cardyDuck: [
    ".........KKRRRRRRKK.........",
    "........KRRRWWWRRrrK........",
    ".......KRRRRWRRRRRrrK.......",
    ".......KRRRRWWWRRRrrK.......",
    ".......KRRRRRRWRRRrrK.......",
    ".......KRRRRWWWRRRrrK.......",
    "......KKRRRRRRRRRRrrKK......",
    ".....KrrrrrrrrrrrrrrrrK.....",
    "....KLLGGGGGGGGGGGGGGDDK....",
    "...KLGGBBBBBBBBBBBBBBGDDK...",
    "..KLLGGBWWWWBGGBWWWWBGGDDK..",
    ".KLGGGGBWWBWBGGBWWBWBGGGDDK.",
    "..KKLDDBWWBWBGGBWWBWBDDDKK..",
    "..KLGGGBBBBBBGGBBBBBBGGDDK..",
    ".KLLGGGGGGGGGGGGGGGGGGGGDDK.",
    "KLGGGGGGGGKKKKKKKKGGGGGGGDDK",
    ".KLDDDGGGGKWWWWWWKGGGGDDDDK.",
    "..KLDDDGGGGKMMMMKGGGGDDDDK..",
    "...KKKKDKKPPKKKKPPKKDKKKK...",
    ".......K.KPPKKKKPPK.K.......",
    "........KKPPK..KPPKK........",
    ".......KWWWWWKKWWWWWK.......",
    "........KKKKK..KKKKK........",
  ],

  // Obstacles
  cone: [
    "....KKK....",
    "....KOK....",
    "...KOOoK...",
    "...KWWWK...",
    "..KOOOooK..",
    "..KWWWWWK..",
    ".KOOOOOooK.",
    ".KOOOOOooK.",
    "KKKKKKKKKKK",
    "KoooooooooK",
    "KKKKKKKKKKK",
  ],
  bike: [
    ".................KKK......",
    ".......KKKK.......K.......",
    ".........K........R.......",
    ".........RRRRRRRRRR.......",
    "...KKKKKRR........RRKKK...",
    "..KK...RK.R.....RRKR..KK..",
    ".K.....R.KR...RRK..R....K.",
    ".K....R..K.RRR..K...R...K.",
    "KK...WRRRRRK...KK...W...KK",
    "KK.......KK....KK.......KK",
    ".K.......K......K.......K.",
    ".K.......K......K.......K.",
    "..KK...KK........KK...KK..",
    "...KKKKK..........KKKKK...",
  ],
  birdUp: [
    "......N.........",
    "......NN........",
    "......NnN.......",
    "..NN..NnnN......",
    ".NWNN.NnnnN.....",
    "YNNNNNNNNNNNNN..",
    "...NNNNNNNNNNNNN",
    ".....NNNNNNN....",
    "................",
    "................",
    "................",
  ],
  birdDown: [
    "................",
    "................",
    "................",
    "..NN............",
    ".NWNN...........",
    "YNNNNNNNNNNNNN..",
    "...NNNNNNNNNNNNN",
    ".....NNnnnNN....",
    "......NnnN......",
    "......NnN.......",
    "......NN........",
  ],

  // Cal Bear, 20x16, walking left. Two walking frames.
  bearWalk1: [
    "..........KKKKKK....",
    ".KK...KK.KVVVVVVKK..",
    "KfFK.KFfKVVVVVVVVVK.",
    "KFFFFFFFFKVVVVVVVVVK",
    "KFKFFFFFFKYYYYYYYYYK",
    "KKTTFFFFFKVVVVVVVVVK",
    "KTTTFFFFFKVVVVVVVVvK",
    ".KTTFFFFKVVVVVVVVVvK",
    "..KKFFFKvvvvvvvvvvvK",
    "...KFFFFFFFFFFFFFFfK",
    "...KFFFFFFFFFFFFFffK",
    "...KFFFFKKKKKKKFFFFK",
    "...KFFFfK.....KFFFfK",
    "...KFFFfK.....KFFFfK",
    "..KffffK.....KffffK.",
    "..KKKKKK.....KKKKKK.",
  ],
  bearWalk2: [
    "..........KKKKKK....",
    ".KK...KK.KVVVVVVKK..",
    "KfFK.KFfKVVVVVVVVVK.",
    "KFFFFFFFFKVVVVVVVVVK",
    "KFKFFFFFFKYYYYYYYYYK",
    "KKTTFFFFFKVVVVVVVVVK",
    "KTTTFFFFFKVVVVVVVVvK",
    ".KTTFFFFKVVVVVVVVVvK",
    "..KKFFFKvvvvvvvvvvvK",
    "...KFFFFFFFFFFFFFFfK",
    "...KFFFFFFFFFFFFFffK",
    "...KFFFFKKKKKKKFFFFK",
    "....KFFFK...KFFFfK..",
    ".....KFFfK.KFFFfK...",
    ".....KfffKKffffK....",
    ".....KKKKKKKKKKK....",
  ],

  // Pickups
  acorn: [
    "....K....",
    "...KaK...",
    ".KKAAAKK.",
    "KAAAAAAaK",
    "KAaAaAaaK",
    "KKKKKKKKK",
    ".KUWUUuK.",
    ".KUUUUuK.",
    ".KUUUuuK.",
    "..KUuuK..",
    "...KKK...",
  ],
  boba: [
    ".....KK..",
    ".....KRK.",
    "....KRK..",
    "..KKRKK..",
    ".KWWRWWK.",
    "KKKKKKKKK",
    "KTTTTTTtK",
    ".KTWTTtK.",
    ".KTTTTtK.",
    ".KTTTTtK.",
    ".KpTpTpK.",
    ".KpppppK.",
    "..KKKKK..",
  ],

  // Scenery
  cloud: [
    "........WWWW..........",
    "......WWWWWWWW........",
    "...WWWWWWWWWWWWW.WWW..",
    "..WWWWWWWWWWWWWWWWWWW.",
    ".WWWWWWWWWWWWWWWWWWWWW",
    "CCCCCCCCCCCCCCCCCCCCCC",
  ],
};
