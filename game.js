window.onload = function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 800;
  canvas.height = 450;

  const GRAVITY = 0.5;
  const FLOOR_Y = canvas.height - 50;

  // Player
  const player = {
    x: 0, y: 0,
    width: 30, height: 30,
    dx: 0, dy: 0,
    speed: 4, jumpPower: 11,
    grounded: false
  };

  const keys = {};
  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);

  // Moving platform class
  class MovingPlatform {
    constructor(x, y, width, height, range, speed) {
      this.x = x;
      this.y = y;
      this.startX = x;
      this.width = width;
      this.height = height;
      this.range = range;
      this.speed = speed;
      this.direction = 1;
    }
    update() {
      this.x += this.speed * this.direction;
      if (this.x > this.startX + this.range || this.x < this.startX) {
        this.direction *= -1;
      }
    }
    draw() {
      ctx.fillStyle = '#00eaff';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  // Rolling Log class
  class Log {
    constructor(x, y, radius, speedX) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.speedX = speedX;
      this.dy = 0;
      this.rotation = 0;
    }
    update() {
      this.dy += GRAVITY;
      this.y += this.dy;
      this.x += this.speedX;
      this.rotation += this.speedX / this.radius;

      // ground collision (simple slope)
      const groundY = slopeGround(this.x);
      if (this.y + this.radius > groundY) {
        this.y = groundY - this.radius;
        this.dy = 0;
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const logs = [];
  let logSpawnTimer = 0;

  // Simple hill function for log levels
  function slopeGround(x) {
    return FLOOR_Y - (x / 4); // gentle downward slope
  }

  // LEVELS
  const levels = [
    // Level 1
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 20, width: 100, height: 20 },
        { x: 220, y: FLOOR_Y - 80, width: 100, height: 20 },
        { x: 400, y: FLOOR_Y - 140, width: 100, height: 20 }
      ],
      finish: { x: 600, y: FLOOR_Y - 180, width: 50, height: 10 },
      movingPlatforms: [],
      logLevel: false
    },

    // Level 2
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 20, width: 100, height: 20 },
        { x: 200, y: FLOOR_Y - 100, width: 100, height: 20 },
        { x: 100, y: FLOOR_Y - 180, width: 100, height: 20 },
        { x: 300, y: FLOOR_Y - 260, width: 100, height: 20 }
      ],
      finish: { x: 500, y: FLOOR_Y - 300, width: 50, height: 10 },
      movingPlatforms: [],
      logLevel: false
    },

    // Level 3
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 20, width: 100, height: 20 },
        { x: 250, y: FLOOR_Y - 40, width: 100, height: 20 },
        { x: 450, y: FLOOR_Y - 60, width: 100, height: 20 },
        { x: 650, y: FLOOR_Y - 80, width: 100, height: 20 }
      ],
      finish: { x: 700, y: FLOOR_Y - 120, width: 50, height: 10 },
      movingPlatforms: [],
      logLevel: false
    },

    // Level 4 — Moving platform challenge
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 100, width: 100, height: 20 }
      ],
      movingPlatforms: [
        new MovingPlatform(220, FLOOR_Y - 120, 100, 15, 150, 2.5)
      ],
      finish: { x: 450, y: FLOOR_Y - 160, width: 50, height: 10 },
      logLevel: false
    },

    // Level 5 — Two moving platforms
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 100, width: 100, height: 20 }
      ],
      movingPlatforms: [
        new MovingPlatform(200, FLOOR_Y - 50, 100, 15, 150, 3),
        new MovingPlatform(450, FLOOR_Y - 140, 100, 15, 120, 2.5)
      ],
      finish: { x: 700, y: FLOOR_Y - 180, width: 50, height: 10 },
      logLevel: false
    },

    // Level 6 — Redesigned moving platform puzzle
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 80, width: 100, height: 20 },
        { x: 400, y: FLOOR_Y - 160, width: 100, height: 20 }
      ],
      movingPlatforms: [
        new MovingPlatform(150, FLOOR_Y - 40, 100, 15, 200, 2.5),
        new MovingPlatform(500, FLOOR_Y - 120, 100, 15, 150, 2.5)
      ],
      finish: { x: 700, y: FLOOR_Y - 180, width: 50, height: 10 },
      logLevel: false
    },

    // Level 7 — Logs rolling down hill
    {
      platforms: [],
      movingPlatforms: [],
      finish: { x: 700, y: FLOOR_Y - 200, width: 50, height: 10 },
      logLevel: true
    },

    // Level 8 — Logs + platforms
    {
      platforms: [
        { x: 300, y: FLOOR_Y - 120, width: 100, height: 20 }
      ],
      movingPlatforms: [],
      finish: { x: 700, y: FLOOR_Y - 200, width: 50, height: 10 },
      logLevel: true
    }
  ];

  let currentLevel = 0;

  function resetPlayer() {
    const level = levels[currentLevel];
    if (level.platforms.length > 0) {
      const p = level.platforms[0];
      player.x = p.x + 10;
      player.y = p.y - player.height;
    } else {
      player.x = 50;
      player.y = FLOOR_Y - player.height;
    }
    player.dx = 0;
    player.dy = 0;
    logs.length = 0;
    logSpawnTimer = 0;
  }

  function updatePlayer() {
    if (keys['ArrowLeft'] || keys['a']) player.dx = -player.speed;
    else if (keys['ArrowRight'] || keys['d']) player.dx = player.speed;
    else player.dx = 0;

    if ((keys['ArrowUp'] || keys[' '] || keys['w']) && player.grounded) {
      player.dy = -player.jumpPower;
      player.grounded = false;
    }

    player.dy += GRAVITY;
    player.x += player.dx;
    player.y += player.dy;
    player.grounded = false;

    const level = levels[currentLevel];

    // Platform collisions
    for (const p of level.platforms) {
      if (player.x < p.x + p.width &&
          player.x + player.width > p.x &&
          player.y < p.y + p.height &&
          player.y + player.height > p.y) {
        if (player.dy >= 0 && player.y + player.height - player.dy <= p.y) {
          player.y = p.y - player.height;
          player.dy = 0;
          player.grounded = true;
        }
      }
    }

    // Moving platform collisions
    for (const mp of level.movingPlatforms) {
      if (player.x < mp.x + mp.width &&
          player.x + player.width > mp.x &&
          player.y < mp.y + mp.height &&
          player.y + player.height > mp.y) {
        if (player.dy >= 0 && player.y + player.height - player.dy <= mp.y) {
          player.y = mp.y - player.height;
          player.dy = 0;
          player.grounded = true;
          player.x += mp.speed * mp.direction;
        }
      }
    }

    // Finish
    const finish = level.finish;
    if (player.x < finish.x + finish.width &&
        player.x + player.width > finish.x &&
        player.y < finish.y + finish.height &&
        player.y + player.height > finish.y) {
      currentLevel++;
      if (currentLevel >= levels.length) {
        alert('🎉 You beat all 8 levels!');
        currentLevel = 0;
      }
      resetPlayer();
    }

    // Fall off
    if (player.y > canvas.height + 100) resetPlayer();
  }

  function updateLogs() {
    logSpawnTimer++;
    if (logSpawnTimer > 120) { // spawn every 2 seconds
      logs.push(new Log(50, -30, 15, 2));
      logSpawnTimer = 0;
    }
    logs.forEach(log => log.update());
    // remove offscreen logs
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].x > canvas.width + 50) logs.splice(i, 1);
    }
  }

  function updateMovingPlatforms() {
    for (const mp of levels[currentLevel].movingPlatforms) {
      mp.update();
    }
  }

  function drawLevel() {
    const level = levels[currentLevel];

    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sloped ground for log levels
    if (level.logLevel) {
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y);
      ctx.lineTo(canvas.width, slopeGround(canvas.width));
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();
    }

    // Platforms
    ctx.fillStyle = '#228B22';
    for (const p of level.platforms) {
      ctx.fillRect(p.x, p.y, p.width, p.height);
    }

    // Moving platforms
    for (const mp of level.movingPlatforms) {
      mp.draw();
    }

    // Finish
    ctx.fillStyle = 'gold';
    ctx.fillRect(level.finish.x, level.finish.y, level.finish.width, level.finish.height);

    // Logs
    logs.forEach(log => log.draw());

    // Player
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  function gameLoop() {
    updatePlayer();
    if (levels[currentLevel].logLevel) updateLogs();
    updateMovingPlatforms();
    drawLevel();
    requestAnimationFrame(gameLoop);
  }

  resetPlayer();
  gameLoop();
};
