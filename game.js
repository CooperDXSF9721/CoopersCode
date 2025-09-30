// === GET CANVAS & CONTEXT ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Safety: set default size if HTML doesn't
if (!canvas.width) canvas.width = 800;
if (!canvas.height) canvas.height = 450;

const FLOOR_Y = canvas.height - 40;

// === LEVEL DEFINITIONS ===
const levels = [
  // LEVEL 1 — simple steps
  {
    platforms: [
      {x: 50, y: 360, width: 120, height: 10},
      {x: 200, y: 320, width: 100, height: 10},
      {x: 370, y: 280, width: 100, height: 10},
    ],
    movingPlatforms: [],
    finish: {x: 550, y: 240, width: 50, height: 10}
  },
  // LEVEL 2 — zig-zag layout
  {
    platforms: [
      {x: 50, y: 360, width: 120, height: 10},
      {x: 220, y: 300, width: 100, height: 10},
      {x: 400, y: 340, width: 100, height: 10},
      {x: 580, y: 280, width: 80, height: 10},
    ],
    movingPlatforms: [],
    finish: {x: 700, y: 240, width: 50, height: 10}
  },
  // LEVEL 3 — tricky spacing
  {
    platforms: [
      {x: 50, y: 360, width: 120, height: 10},
      {x: 260, y: 310, width: 80, height: 10},
      {x: 460, y: 270, width: 100, height: 10},
      {x: 640, y: 320, width: 80, height: 10},
    ],
    movingPlatforms: [],
    finish: {x: 740, y: 280, width: 50, height: 10}
  },
  // LEVEL 4 — requires moving platform to finish
  {
    platforms: [
      {x: 50, y: FLOOR_Y - 100, width: 120, height: 10},
    ],
    movingPlatforms: [
      {x: 200, y: FLOOR_Y - 20, width: 100, height: 10, minX: 200, maxX: 500, dx: 2}
    ],
    finish: {x: 600, y: FLOOR_Y - 20, width: 50, height: 10}
  },
  // LEVEL 5 — mid-air jump required
  {
    platforms: [
      {x: 50, y: FLOOR_Y - 100, width: 120, height: 10},
      {x: 350, y: FLOOR_Y - 150, width: 100, height: 10}
    ],
    movingPlatforms: [
      {x: 150, y: FLOOR_Y - 20, width: 100, height: 10, minX: 150, maxX: 550, dx: 2}
    ],
    finish: {x: 600, y: FLOOR_Y - 150, width: 50, height: 10}
  },
  // LEVEL 6 — moving platform + timing challenge
  {
    platforms: [
      {x: 300, y: FLOOR_Y - 100, width: 120, height: 10},
    ],
    movingPlatforms: [
      {x: 60, y: FLOOR_Y - 20, width: 100, height: 10, minX: 60, maxX: 540, dx: 2}
    ],
    finish: {x: 560, y: FLOOR_Y - 20, width: 50, height: 10}
  }
];

// === PLAYER ===
let currentLevel = 0;
const player = {
  x: 80, y: 300,
  width: 30, height: 30,
  dx: 0, dy: 0,
  onGround: false
};

const keys = { left: false, right: false, up: false };

// === INPUT ===
document.addEventListener('keydown', e => {
  if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'w' || e.key === 'ArrowUp' || e.code === 'Space') keys.up = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'w' || e.key === 'ArrowUp' || e.code === 'Space') keys.up = false;
});

// === HELPER FUNCTIONS ===
function resetPlayer() {
  player.x = 80;
  player.y = 300;
  player.dx = 0;
  player.dy = 0;
}

function nextLevel() {
  currentLevel++;
  if (currentLevel >= levels.length) {
    alert('🎉 You beat all 6 levels!');
    currentLevel = 0;
  }
  resetPlayer();
}

// === GAME LOOP ===
function gameLoop() {
  const level = levels[currentLevel];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GRAVITY
  player.dy += 0.5;
  if (player.dy > 10) player.dy = 10;
  player.onGround = false;

  // HORIZONTAL INPUT
  player.dx = 0;
  if (keys.left) player.dx = -3;
  if (keys.right) player.dx = 3;

  player.x += player.dx;
  player.y += player.dy;

  // LAVA FLOOR
  ctx.fillStyle = 'orangered';
  ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);
  if (player.y + player.height > FLOOR_Y) resetPlayer();

  // MOVE MOVING PLATFORMS
  level.movingPlatforms.forEach(mp => {
    mp.x += mp.dx;
    if (mp.x < mp.minX || mp.x + mp.width > mp.maxX) {
      mp.dx *= -1;
      mp.x += mp.dx;
    }
  });

  // COLLISIONS
  const allPlatforms = [...level.platforms, ...level.movingPlatforms];
  allPlatforms.forEach(p => {
    // LAND ON TOP
    if (player.x + player.width > p.x && player.x < p.x + p.width) {
      if (player.y + player.height > p.y && player.y + player.height - player.dy <= p.y) {
        player.y = p.y - player.height;
        player.dy = 0;
        player.onGround = true;
        if (level.movingPlatforms.includes(p)) player.x += p.dx;
      }
    }
    // HEAD BUMP
    if (player.x + player.width > p.x && player.x < p.x + p.width) {
      if (player.y < p.y + p.height && player.y - player.dy >= p.y + p.height) {
        player.y = p.y + p.height;
        player.dy = 1;
      }
    }
  });

  // JUMP
  if (keys.up && player.onGround) {
    player.dy = -10;
    player.onGround = false;
  }

  // FINISH COLLISION
  const f = level.finish;
  if (
    player.x + player.width > f.x &&
    player.x < f.x + f.width &&
    player.y + player.height > f.y &&
    player.y < f.y + f.height
  ) {
    nextLevel();
  }

  // DRAW
  ctx.fillStyle = 'green';
  level.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  ctx.fillStyle = 'cyan';
  level.movingPlatforms.forEach(mp => {
    ctx.fillRect(mp.x, mp.y, mp.width, mp.height);
    ctx.strokeStyle = 'lightblue';
    ctx.strokeRect(mp.x - 2, mp.y - 2, mp.width + 4, mp.height + 4);
  });

  ctx.fillStyle = 'gold';
  ctx.fillRect(f.x, f.y, f.width, f.height);

  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  requestAnimationFrame(gameLoop);
}

resetPlayer();
gameLoop();
