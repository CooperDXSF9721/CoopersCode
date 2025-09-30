const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FLOOR_Y = canvas.height - 40;

// ===== LEVEL DATA =====
const levels = [
  // ===== STATIC PLATFORM LEVELS =====
  // LEVEL 1 — simple first challenge
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10},
      {x: 200, y: 310, width: 100, height: 10},
      {x: 340, y: 270, width: 100, height: 10},
      {x: 480, y: 320, width: 80, height: 10} // step back down
    ],
    movingPlatform: null,
    finish: {x: 560, y: 280, width: 50, height: 10}
  },
  // LEVEL 2 — zig-zag layout, not just rising steps
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10},
      {x: 180, y: 300, width: 100, height: 10},
      {x: 320, y: 340, width: 80, height: 10}, // lower platform
      {x: 420, y: 280, width: 100, height: 10},
      {x: 540, y: 320, width: 80, height: 10}
    ],
    movingPlatform: null,
    finish: {x: 600, y: 260, width: 50, height: 10}
  },
  // LEVEL 3 — platforms spread horizontally with gaps
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10},
      {x: 200, y: 310, width: 80, height: 10},
      {x: 320, y: 270, width: 120, height: 10},
      {x: 460, y: 320, width: 100, height: 10},
      {x: 580, y: 280, width: 80, height: 10}
    ],
    movingPlatform: null,
    finish: {x: 640, y: 250, width: 50, height: 10}
  },

  // ===== MOVING PLATFORM LEVELS =====
  // LEVEL 4 — simple moving platform required
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10}
    ],
    movingPlatform: {
      x: 140,
      y: FLOOR_Y - 20,
      width: 100,
      height: 10,
      minX: 140,
      maxX: 400,
      speed: 2,
      dx: 2
    },
    finish: {x: 450, y: FLOOR_Y - 30, width: 50, height: 10}
  },
  // LEVEL 5 — multiple moving platforms for timing
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10},
      {x: 260, y: 320, width: 100, height: 10}
    ],
    movingPlatform: {
      x: 140,
      y: FLOOR_Y - 60,
      width: 100,
      height: 10,
      minX: 140,
      maxX: 400,
      speed: 2,
      dx: 2
    },
    finish: {x: 500, y: FLOOR_Y - 30, width: 50, height: 10}
  },
  // LEVEL 6 — timing + jump puzzle with moving platform and middle normal platform
  {
    platforms: [
      {x: 260, y: FLOOR_Y - 100, width: 100, height: 10} // normal platform in middle
    ],
    movingPlatform: {
      x: 60,
      y: FLOOR_Y - 20,
      width: 100,
      height: 10,
      minX: 60,
      maxX: 500,
      speed: 2,
      dx: 2
    },
    finish: {x: 520, y: FLOOR_Y - 20, width: 50, height: 10} // finish at same height as moving platform
  }
];

// ===== PLAYER =====
let currentLevel = 0;
let player = {x: 80, y: 300, width: 30, height: 30, dx: 0, dy: 0, onGround: false};
const keys = {left: false, right: false, up: false};

// ===== INPUT =====
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

function resetPlayer() {
  player.x = 80;
  player.y = 300;
  player.dx = 0;
  player.dy = 0;
}

// ===== GAME LOOP =====
function gameLoop() {
  const level = levels[currentLevel];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gravity
  player.dy += 0.5;
  if (player.dy > 10) player.dy = 10;
  player.onGround = false;

  // Horizontal movement
  player.dx = 0;
  if (keys.left) player.dx = -3;
  if (keys.right) player.dx = 3;

  player.x += player.dx;
  player.y += player.dy;

  // Floor lava
  ctx.fillStyle = 'orangered';
  ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);

  // Lava collision
  if (player.y + player.height > FLOOR_Y) {
    resetPlayer();
  }

  // ===== PLATFORM COLLISIONS =====
  const allPlatforms = [...level.platforms];
  if (level.movingPlatform) allPlatforms.push(level.movingPlatform);

  allPlatforms.forEach(p => {
    // Landing on top
    if (player.x + player.width > p.x && player.x < p.x + p.width) {
      if (player.y + player.height > p.y && player.y + player.height - player.dy <= p.y) {
        player.y = p.y - player.height;
        player.dy = 0;
        player.onGround = true;

        // Move player with moving platform
        if (level.movingPlatform && p === level.movingPlatform) {
          player.x += level.movingPlatform.dx;
        }
      }
    }
    // Hitting bottom
    if (player.x + player.width > p.x && player.x < p.x + p.width) {
      if (player.y < p.y + p.height && player.y - player.dy >= p.y + p.height) {
        player.y = p.y + p.height;
        player.dy = 1;
      }
    }
  });

  // Jump
  if (keys.up && player.onGround) {
    player.dy = -10;
    player.onGround = false;
  }

  // ===== MOVING PLATFORM LOGIC =====
  if (level.movingPlatform) {
    const mp = level.movingPlatform;
    mp.x += mp.dx;
    if (mp.x < mp.minX || mp.x + mp.width > mp.maxX) {
      mp.dx *= -1;
      mp.x += mp.dx; // prevent overshoot
    }
  }

  // ===== DRAW PLATFORMS =====
  ctx.fillStyle = 'green';
  level.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  // Draw moving platform
  if (level.movingPlatform) {
    const mp = level.movingPlatform;
    ctx.fillStyle = 'cyan';
    ctx.fillRect(mp.x, mp.y, mp.width, mp.height);
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 2;
    ctx.strokeRect(mp.x - 2, mp.y - 2, mp.width + 4, mp.height + 4);
  }

  // Draw finish
  const f = level.finish;
  ctx.fillStyle = 'gold';
  ctx.fillRect(f.x, f.y, f.width, f.height);

  // Draw player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player
