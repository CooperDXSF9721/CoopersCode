const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FLOOR_Y = canvas.height - 40;

// ===== LEVEL DATA =====
const levels = [
  // ========== LEVEL 1 (Basic challenge) ==========
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10},
      {x: 220, y: 310, width: 100, height: 10},
      {x: 400, y: 270, width: 100, height: 10},
    ],
    movingPlatforms: [],
    finish: {x: 550, y: 230, width: 50, height: 10}
  },

  // ========== LEVEL 2 (Zig-zag path) ==========
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10},
      {x: 200, y: 300, width: 100, height: 10},
      {x: 350, y: 340, width: 80, height: 10},   // drop down a bit
      {x: 500, y: 280, width: 100, height: 10}
    ],
    movingPlatforms: [],
    finish: {x: 620, y: 240, width: 50, height: 10}
  },

  // ========== LEVEL 3 (Gaps & trickier jumps) ==========
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10},
      {x: 240, y: 300, width: 80, height: 10},
      {x: 400, y: 260, width: 100, height: 10},
      {x: 560, y: 310, width: 80, height: 10}
    ],
    movingPlatforms: [],
    finish: {x: 660, y: 270, width: 50, height: 10}
  },

  // ========== LEVEL 4 (First moving platform) ==========
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10},
    ],
    movingPlatforms: [
      {
        x: 150,
        y: FLOOR_Y - 20,
        width: 100,
        height: 10,
        minX: 150,
        maxX: 400,
        speed: 2,
        dx: 2
      }
    ],
    finish: {x: 480, y: FLOOR_Y - 20, width: 50, height: 10}
  },

  // ========== LEVEL 5 (Two platforms, timing) ==========
  {
    platforms: [
      {x: 60, y: 350, width: 120, height: 10},
      {x: 300, y: 300, width: 100, height: 10}
    ],
    movingPlatforms: [
      {
        x: 150,
        y: FLOOR_Y - 40,
        width: 100,
        height: 10,
        minX: 150,
        maxX: 450,
        speed: 2,
        dx: 2
      }
    ],
    finish: {x: 520, y: FLOOR_Y - 20, width: 50, height: 10}
  },

  // ========== LEVEL 6 (Timing + mid platform challenge) ==========
  {
    platforms: [
      {x: 300, y: FLOOR_Y - 100, width: 120, height: 10}, // middle platform
    ],
    movingPlatforms: [
      {
        x: 60,
        y: FLOOR_Y - 20,
        width: 100,
        height: 10,
        minX: 60,
        maxX: 540,
        speed: 2,
        dx: 2
      }
    ],
    finish: {x: 560, y: FLOOR_Y - 20, width: 50, height: 10}
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

  // ===== Moving platform motion =====
  level.movingPlatforms.forEach(mp => {
    mp.x += mp.dx;
    if (mp.x < mp.minX || mp.x + mp.width > mp.maxX) {
      mp.dx *= -1;
      mp.x += mp.dx;
    }
  });

  // ===== Platform collisions (including moving) =====
  const allPlatforms = [...level.platforms, ...level.movingPlatforms];

  allPlatforms.forEach(p => {
    // Land on top
    if (player.x + player.width > p.x && player.x < p.x + p.width) {
      if (player.y + player.height > p.y && player.y + player.height - player.dy <= p.y) {
        player.y = p.y - player.height;
        player.dy = 0;
        player.onGround = true;

        // Stick to moving platforms
        if (level.movingPlatforms.includes(p)) {
          player.x += p.dx;
        }
      }
    }
    // Hit bottom
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

  // ===== Finish line check =====
  const f = level.finish;
  if (
    player.x + player.width > f.x &&
    player.x < f.x + f.width &&
    player.y + player.height > f.y &&
    player.y < f.y + f.height
  ) {
    currentLevel++;
    if (currentLevel >= levels.length) {
      alert('🎉 You beat all 6 levels!');
      currentLevel = 0;
    }
    resetPlayer();
  }

  // ===== Draw platforms =====
  ctx.fillStyle = 'green';
  level.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  // Moving platforms
  ctx.fillStyle = 'cyan';
  level.movingPlatforms.forEach(mp => {
    ctx.fillRect(mp.x, mp.y, mp.width, mp.height);
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 2;
    ctx.strokeRect(mp.x - 2, mp.y - 2, mp.width + 4, mp.height + 4);
  });

  // Finish
  ctx.fillStyle = 'gold';
  ctx.fillRect(f.x, f.y, f.width, f.height);

  // Player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  requestAnimationFrame(gameLoop);
}

resetPlayer();
gameLoop();
