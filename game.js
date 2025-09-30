const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FLOOR_Y = canvas.height - 40;

// ===== LEVEL DATA =====
const levels = [
  // LEVEL 1 — simple staircase to finish
  {
    platforms: [
      {x: 80, y: 350, width: 100, height: 10},
      {x: 280, y: 310, width: 100, height: 10},
      {x: 160, y: 270, width: 100, height: 10},
    ],
    movingPlatform: null,
    finish: {x: 400, y: 250, width: 50, height: 10}
  },
  // LEVEL 2 — moving platform required to reach finish
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10}, // starting platform
    ],
    movingPlatform: {
      x: 140,           // closer to starting platform
      y: 290,           // lower for easier jump
      width: 100,
      height: 10,
      minX: 140,
      maxX: 450,
      speed: 2,
      dx: 2,
      baseY: 290,       // for bobbing
      bobAmplitude: 10, // pixels to move up/down
      bobSpeed: 0.1,    // faster bobbing
      bobAngle: 0
    },
    finish: {x: 450, y: 250, width: 50, height: 10} // finish only reachable via moving platform
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
          player.y += level.movingPlatform.bobAmplitude * Math.sin(level.movingPlatform.bobAngle) - (p.y - level.movingPlatform.y);
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
    // Horizontal movement
    mp.x += mp.dx;
    if (mp.x < mp.minX || mp.x + mp.width > mp.maxX) {
      mp.dx *= -1;
      mp.x += mp.dx; // prevent overshoot
    }
    // Vertical bobbing
    mp.bobAngle += mp.bobSpeed;
    mp.y = mp.baseY + mp.bobAmplitude * Math.sin(mp.bobAngle);
  }

  // ===== DRAW PLATFORMS =====
  ctx.fillStyle = 'green';
  level.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  // Draw moving platform with floating effect
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
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // ===== FINISH CHECK =====
  if (
    player.x + player.width > f.x &&
    player.x < f.x + f.width &&
    player.y + player.height > f.y &&
    player.y < f.y + f.height
  ) {
    currentLevel++;
    if (currentLevel >= levels.length) {
      alert('🎉 You beat all levels!');
      currentLevel = 0;
    }
    resetPlayer();
  }

  requestAnimationFrame(gameLoop);
}

resetPlayer();
gameLoop();
