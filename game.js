window.onload = function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 800;
  canvas.height = 450;

  const GRAVITY = 0.5;
  const FLOOR_Y = canvas.height - 50;

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

  class MovingPlatform {
    constructor(x, y, width, height, range, speed) {
      this.x = x; this.y = y;
      this.startX = x; this.width = width;
      this.height = height; this.range = range;
      this.speed = speed; this.direction = 1;
    }
    update() {
      this.x += this.speed * this.direction;
      if (this.x > this.startX + this.range || this.x < this.startX) this.direction *= -1;
    }
    draw() {
      ctx.fillStyle = '#00eaff';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  class Log {
    constructor(x, y, radius, speedX) {
      this.x = x; this.y = y;
      this.radius = radius; this.speedX = speedX;
      this.dy = 0; this.rotation = 0;
    }
    update() {
      this.dy += GRAVITY;
      this.y += this.dy;
      this.x += this.speedX;
      this.rotation += this.speedX / this.radius;

      const groundY = slopeGround(this.x);
      if (this.y + this.radius > groundY) {
        this.y = groundY - this.radius;
        this.dy = 0;
      }

      // Player collision
      if (player.x + player.width > this.x - this.radius &&
          player.x < this.x + this.radius &&
          player.y + player.height > this.y - this.radius &&
          player.y < this.y + this.radius) {
        resetPlayer();
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

  function slopeGround(x) { return FLOOR_Y - (x / 4); }

  const levels = [
    { platforms: [{ x: 50, y: FLOOR_Y - 20, width: 100, height: 20 }, { x: 220, y: FLOOR_Y - 80, width: 100, height: 20 }, { x: 400, y: FLOOR_Y - 140, width: 100, height: 20 }], finish: { x: 600, y: FLOOR_Y - 180, width: 50, height: 10 }, movingPlatforms: [], logLevel: false },
    { platforms: [{ x: 50, y: FLOOR_Y - 20, width: 100, height: 20 }, { x: 200, y: FLOOR_Y - 100, width: 100, height: 20 }, { x: 100, y: FLOOR_Y - 180, width: 100, height: 20 }, { x: 300, y: FLOOR_Y - 260, width: 100, height: 20 }], finish: { x: 500, y: FLOOR_Y - 300, width: 50, height: 10 }, movingPlatforms: [], logLevel: false },
    { platforms: [{ x: 50, y: FLOOR_Y - 20, width: 100, height: 20 }, { x: 250, y: FLOOR_Y - 40, width: 100, height: 20 }, { x: 450, y: FLOOR_Y - 60, width: 100, height: 20 }, { x: 650, y: FLOOR_Y - 80, width: 100, height: 20 }], finish: { x: 700, y: FLOOR_Y - 120, width: 50, height: 10 }, movingPlatforms: [], logLevel: false },
    { platforms: [{ x: 50, y: FLOOR_Y - 100, width: 100, height: 20 }], movingPlatforms: [new MovingPlatform(220, FLOOR_Y - 120, 100, 15, 150, 2.5)], finish: { x: 450, y: FLOOR_Y - 160, width: 50, height: 10 }, logLevel: false },
    { platforms: [{ x: 50, y: FLOOR_Y - 100, width: 100, height: 20 }], movingPlatforms: [new MovingPlatform(200, FLOOR_Y - 50, 100, 15, 150, 3), new MovingPlatform(450, FLOOR_Y - 140, 100, 15, 120, 2.5)], finish: { x: 700, y: FLOOR_Y - 180, width: 50, height: 10 }, logLevel: false },
    { platforms: [{ x: 50, y: FLOOR_Y - 80, width: 100, height: 20 }], movingPlatforms: [new MovingPlatform(150, FLOOR_Y - 40, 100, 15, 200, 2.5), new MovingPlatform(500, FLOOR_Y - 120, 100, 15, 150, 2.5)], finish: { x: 700, y: FLOOR_Y - 180, width: 50, height: 10 }, logLevel: false },
    { platforms: [], movingPlatforms: [], finish: { x: 700, y: FLOOR_Y - 200, width: 50, height: 10 }, logLevel: true },
    { platforms: [{ x: 300, y: FLOOR_Y - 120, width: 100, height: 20 }], movingPlatforms: [], finish: { x: 700, y: FLOOR_Y - 200, width: 50, height: 10 }, logLevel: true }
  ];

  let currentLevel = 0;

  function resetPlayer() {
    const level = levels[currentLevel];
    if (level.logLevel) {
      player.x = 50;
      player.y = slopeGround(50) - player.height;
    } else if (level.platforms.length > 0) {
      const p = level.platforms[0];
      player.x = p.x + 10;
      player.y = p.y - player.height;
    } else {
      player.x = 50;
      player.y = FLOOR_Y - player.height;
    }
    player.dx = 0; player.dy = 0;
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

    for (const p of level.platforms) {
      if (player.x < p.x + p.width &&
          player.x + player.width > p.x &&
          player.y < p.y + p.height &&
          player.y + player.height > p.y) {
        const prevBottom = player.y - player.dy + player.height;
        const prevTop = player.y - player.dy;
        if (prevBottom <= p.y && player.dy >= 0) {
          player.y = p.y - player.height;
          player.dy = 0;
          player.grounded = true;
        } else if (prevTop >= p.y + p.height && player.dy < 0) {
          player.y = p.y + p.height;
          player.dy = 0;
        }
      }
    }

    for (const mp of level.movingPlatforms) {
      if (player.x < mp.x + mp.width &&
          player.x + player.width > mp.x &&
          player.y < mp.y + mp.height &&
          player.y + player.height > mp.y) {
        const prevBottom = player.y - player.dy + player.height;
        const prevTop = player.y - player.dy;
        if (prevBottom <= mp.y && player.dy >= 0) {
          player.y = mp.y - player.height;
          player.dy = 0;
          player.grounded = true;
          player.x += mp.speed * mp.direction;
        } else if (prevTop >= mp.y + mp.height && player.dy < 0) {
          player.y = mp.y + mp.height;
          player.dy = 0;
        }
      }
    }

    const f = level.finish;
    if (player.x < f.x + f.width &&
        player.x + player.width > f.x &&
        player.y < f.y + f.height &&
        player.y + player.height > f.y) {
      currentLevel++;
      if (currentLevel >= levels.length) {
        alert('🎉 You beat all 8 levels!');
        currentLevel = 0;
      }
      resetPlayer();
    }

    if (player.y > canvas.height + 100) resetPlayer();
  }

  function updateLogs() {
    logSpawnTimer++;
    if (logSpawnTimer > 120) {
      logs.push(new Log(50, -30, 15, 2));
      logSpawnTimer = 0;
    }
    logs.forEach(log => log.update());
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].x > canvas.width + 50) logs.splice(i, 1);
    }
  }

  function updateMovingPlatforms() {
    for (const mp of levels[currentLevel].movingPlatforms) mp.update();
  }

  function drawLevel() {
    const level = levels[currentLevel];
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    ctx.fillStyle = '#228B22';
    for (const p of level.platforms) ctx.fillRect(p.x, p.y, p.width, p.height
