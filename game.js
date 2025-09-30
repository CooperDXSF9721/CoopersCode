const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FLOOR_Y = canvas.height - 40;

// ===== LEVEL DATA =====
const levels = [
  // LEVEL 1 — Simple staircase path
  {
    platforms: [
      {x: 80, y: 350, width: 100, height: 10},
      {x: 280, y: 310, width: 100, height: 10},
      {x: 120, y: 270, width: 100, height: 10},
      {x: 320, y: 230, width: 100, height: 10},
      {x: 160, y: 190, width: 100, height: 10},
    ],
    walls: [],
    finish: {x: 380, y: 150, width: 50, height: 10}
  },
  // LEVEL 2 — Staircase + wall with tunnel
  {
    platforms: [
      {x: 70, y: 350, width: 100, height: 10},
      {x: 300, y: 310, width: 100, height: 10},
      {x: 120, y: 270, width: 100, height: 10},
      {x: 350, y: 230, width: 100, height: 10},
      {x: 150, y: 190, width: 100, height: 10},
      {x: 420, y: 150, width: 100, height: 10},
    ],
    walls: [
      {x: 250, width: 40, openingY: 270, openingHeight: 80}, // wall with a tunnel
    ],
    finish: {x: 500, y: 150, width: 50, height: 10}
  },
  // LEVEL 3 — More complex wall and path
  {
    platforms: [
      {x: 80, y: 350, width: 100, height: 10},
      {x: 450, y: 330, width: 100, height: 10},
      {x: 150, y: 280, width: 100, height: 10},
      {x: 400, y: 230, width: 100, height: 10},
      {x: 180, y: 190, width: 100, height: 10},
      {x: 420, y: 150, width: 100, height: 10},
    ],
    walls: [
      {x: 300, width: 40, openingY: 240, openingHeight: 90},
      {x: 520, width: 40, openingY: 180, openingHeight: 80},
    ],
    finish: {x: 600, y: 130, width: 50, height: 10}
  },
  // LEVEL 4 — Big staircase, finish behind wall
  {
    platforms: [
      {x: 60, y: 350, width: 100, height: 10},
      {x: 300, y: 310, width: 100, height: 10},
      {x: 120, y: 270, width: 100, height: 10},
      {x: 340, y: 230, width: 100, height: 10},
      {x: 160, y: 190, width: 100, height: 10},
      {x: 380, y: 150, width: 100, height: 10},
    ],
    walls: [
      {x: 500, width: 40, openingY: 260, openingHeight: 100}, // must go under and up
    ],
    finish: {x: 560, y: 150, width: 50, height: 10}
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

  // Walls
  ctx.fillStyle = '#654321';
  level.walls.forEach(w => {
    // Draw top wall part
    ctx.fillRect(w.x, 0, w.width, w.openingY);
    // Draw bottom wall part
    ctx.fillRect(w.x, w.openingY + w.openingHeight, w.width, FLOOR_Y - (w.openingY + w.openingHeight));

    // Collision with walls
    if (player.x + player.width > w.x && player.x < w.x + w.width) {
      if (!(player.y + player.height > w.openingY && player.y < w.openingY + w.openingHeight)) {
        // Player is not in the opening
        if (player.dx > 0) player.x = w.x - player.width;
        if (player.dx < 0) player.x = w.x + w.width;
      }
    }
  });

  // Platform collisions (no going through from below)
  level.platforms.forEach(p => {
    // Landing on top of platform
    if (player.x + player.width > p.x && player.x < p.x + p.width) {
      if (player.y + player.height > p.y && player.y + player.height - player.dy <= p.y) {
        player.y = p.y - player.height;
        player.dy = 0;
        player.onGround = true;
      }
    }

    // Prevent going through from below
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

  // Finish line
  const f = level.finish;
  if (
    player.x + player.width > f.x &&
    player.x < f.x + f.width &&
    player.y + player.height > f.y &&
    player.y < f.y + f.height
  ) {
    currentLevel++;
    if (currentLevel >= levels.length) {
      alert('🎉 You beat all 4 levels!');
      currentLevel = 0;
    }
    resetPlayer();
  }

  // Pillars under platforms
  ctx.fillStyle = '#5B3A1B';
  level.platforms.forEach(p => {
    ctx.fillRect(p.x + p.width / 2 - 5, p.y, 10, FLOOR_Y - p.y);
  });

  // Draw platforms
  ctx.fillStyle = 'green';
  level.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

  // Draw finish
  ctx.fillStyle = 'gold';
  ctx.fillRect(f.x, f.y, f.width, f.height);

  // Draw player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  requestAnimationFrame(gameLoop);
}

resetPlayer();
gameLoop();
