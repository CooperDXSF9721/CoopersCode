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
  // LEVEL 2 — Staircase + wall with aligned tunnel
  {
    platforms: [
      {x: 70, y: 350, width: 100, height: 10},
      {x: 250, y: 310, width: 100, height: 10},
      {x: 120, y: 270, width: 100, height: 10},
      {x: 350, y: 230, width: 100, height: 10},
      {x: 150, y: 190, width: 100, height: 10},
      {x: 420, y: 150, width: 100, height: 10},
    ],
    walls: [
      {x: 350, width: 40, openingY: 230, openingHeight: 80},
    ],
    finish: {x: 500, y: 150, width: 50, height: 10}
  },
  // LEVEL 3 — More complex walls with aligned jumps
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
      {x: 400, width: 40, openingY: 230, openingHeight: 80},
      {x: 420, width: 40, openingY: 150, openingHeight: 80},
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
      {x: 340, width: 40, openingY: 230, openingHeight: 80},
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

  // ===== WALLS WITH LANDING PLATFORM =====
  ctx.fillStyle = '#654321';
  level.walls.forEach(w => {
    const topWall = {x: w.x, y: 0, width: w.width, height: w.openingY};
    const bottomWall = {x: w.x, y: w.openingY + w.openingHeight, width: w.width, height: FLOOR_Y - (w.openingY + w.openingHeight)};
    const openingPlatform = {x: w.x, y: w.openingY + w.openingHeight - 10, width: w.width, height: 10};

    // Draw walls
    ctx.fillRect(topWall.x, topWall.y, topWall.width, topWall.height);
    ctx.fillRect(bottomWall.x, bottomWall.y, bottomWall.width, bottomWall.height);

    // Draw landing platform
    ctx.fillStyle = 'green';
    ctx.fillRect(openingPlatform.x, openingPlatform.y, openingPlatform.width, openingPlatform.height);

    // Collision helper
    function collideRect(a, b) {
      return a.x < b.x + b.width && a.x + a.width > b.x &&
             a.y < b.y + b.height && a.y + a.height > b.y;
    }

    // Top wall collision
    if (collideRect(player, topWall)) {
      if (player.dx > 0) player.x = topWall.x - player.width;
      if (player.dx < 0) player.x = topWall.x + topWall.width;
      if (player.y + player.height - player.dy <= topWall.y + topWall.height) {
        player.y = topWall.y + topWall.height;
        player.dy = 1;
      }
    }

    // Bottom wall collision
    if (collideRect(player, bottomWall)) {
      if (player.dx > 0) player.x = bottomWall.x - player.width;
      if (player.dx < 0) player.x = bottomWall.x + bottomWall.width;
      if (player.y - player.dy >= bottomWall.y) {
        player.y = bottomWall.y + bottomWall.height;
        player.dy = 1;
      }
    }

    // Opening platform collision (fall onto it)
    if (collideRect(player, openingPlatform)) {
      if (player.y + player.height > openingPlatform.y && player.y + player.height - player.dy <= openingPlatform.y) {
        player.y = openingPlatform.y - player.height;
        player.dy = 0;
        player.onGround = true;
      }
    }
  });

  // ===== PLATFORM COLLISIONS =====
  level.platforms.forEach(p => {
    // Landing on top
    if (player.x + player.width > p.x && player.x < p.x + p.width) {
      if (player.y + player.height > p.y && player.y + player.height - player.dy <= p.y) {
        player.y = p.y - player.height;
        player.dy = 0;
        player.onGround = true;
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
