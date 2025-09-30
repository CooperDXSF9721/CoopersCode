window.onload = function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Canvas size
  canvas.width = 800;
  canvas.height = 450;

  // Gravity and floor
  const GRAVITY = 0.5;
  const FLOOR_Y = canvas.height - 50;

  // Player setup
  const player = {
    x: 0,
    y: 0,
    width: 30,
    height: 30,
    dx: 0,
    dy: 0,
    speed: 4,
    jumpPower: 11,
    grounded: false
  };

  // Controls
  const keys = {};
  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);

  // Moving platform structure
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

  // Levels array
  const levels = [
    // LEVEL 1 — Simple 3-step platform
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 20, width: 100, height: 20 },
        { x: 220, y: FLOOR_Y - 80, width: 100, height: 20 },
        { x: 400, y: FLOOR_Y - 140, width: 100, height: 20 }
      ],
      finish: { x: 600, y: FLOOR_Y - 180, width: 50, height: 10 },
      movingPlatforms: []
    },

    // LEVEL 2 — Zigzag jump
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 20, width: 100, height: 20 },
        { x: 200, y: FLOOR_Y - 100, width: 100, height: 20 },
        { x: 100, y: FLOOR_Y - 180, width: 100, height: 20 },
        { x: 300, y: FLOOR_Y - 260, width: 100, height: 20 }
      ],
      finish: { x: 500, y: FLOOR_Y - 300, width: 50, height: 10 },
      movingPlatforms: []
    },

    // LEVEL 3 — Long jump gaps
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 20, width: 100, height: 20 },
        { x: 250, y: FLOOR_Y - 40, width: 100, height: 20 },
        { x: 450, y: FLOOR_Y - 60, width: 100, height: 20 },
        { x: 650, y: FLOOR_Y - 80, width: 100, height: 20 }
      ],
      finish: { x: 700, y: FLOOR_Y - 120, width: 50, height: 10 },
      movingPlatforms: []
    },

    // LEVEL 4 — Single moving platform required
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 100, width: 100, height: 20 },
        { x: 500, y: FLOOR_Y - 200, width: 100, height: 20 }
      ],
      movingPlatforms: [
        new MovingPlatform(180, FLOOR_Y - 20, 100, 15, 150, 2.5)
      ],
      finish: { x: 650, y: FLOOR_Y - 220, width: 50, height: 10 }
    },

    // LEVEL 5 — Two moving platforms in sequence
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 100, width: 100, height: 20 },
        { x: 600, y: FLOOR_Y - 180, width: 100, height: 20 }
      ],
      movingPlatforms: [
        new MovingPlatform(200, FLOOR_Y - 30, 100, 15, 150, 3),
        new MovingPlatform(400, FLOOR_Y - 120, 100, 15, 120, 2.5)
      ],
      finish: { x: 720, y: FLOOR_Y - 200, width: 50, height: 10 }
    },

    // LEVEL 6 — Jump off moving platform onto static and back
    {
      platforms: [
        { x: 50, y: FLOOR_Y - 100, width: 100, height: 20 },
        { x: 400, y: FLOOR_Y - 160, width: 100, height: 20 } // middle static platform
      ],
      movingPlatforms: [
        new MovingPlatform(100, FLOOR_Y - 20, 100, 15, 500, 3)
      ],
      finish: { x: 700, y: FLOOR_Y - 180, width: 50, height: 10 }
    }
  ];

  let currentLevel = 0;

  function resetPlayer() {
    const level = levels[currentLevel];
    const startPlatform = level.platforms[0];
    player.x = startPlatform.x + 10;
    player.y = startPlatform.y - player.height;
    player.dx = 0;
    player.dy = 0;
  }

  function updatePlayer() {
    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a']) player.dx = -player.speed;
    else if (keys['ArrowRight'] || keys['d']) player.dx = player.speed;
    else player.dx = 0;

    // Jump
    if ((keys['ArrowUp'] || keys[' '] || keys['w']) && player.grounded) {
      player.dy = -player.jumpPower;
      player.grounded = false;
    }

    // Apply gravity
    player.dy += GRAVITY;

    // Move horizontally
    player.x += player.dx;

    // Move vertically
    player.y += player.dy;

    const level = levels[currentLevel];
    player.grounded = false;

    // Collision with static platforms
    for (const p of level.platforms) {
      if (player.x < p.x + p.width &&
          player.x + player.width > p.x &&
          player.y < p.y + p.height &&
          player.y + player.height > p.y) {

        // Landing on top
        if (player.dy >= 0 && player.y + player.height - player.dy <= p.y) {
          player.y = p.y - player.height;
          player.dy = 0;
          player.grounded = true;
        }
      }
    }

    // Collision with moving platforms
    for (const mp of level.movingPlatforms) {
      if (player.x < mp.x + mp.width &&
          player.x + player.width > mp.x &&
          player.y < mp.y + mp.height &&
          player.y + player.height > mp.y) {

        // Land on top
        if (player.dy >= 0 && player.y + player.height - player.dy <= mp.y) {
          player.y = mp.y - player.height;
          player.dy = 0;
          player.grounded = true;
          // Stick to platform
          player.x += mp.speed * mp.direction;
        }
      }
    }

    // Check finish
    const finish = level.finish;
    if (player.x < finish.x + finish.width &&
        player.x + player.width > finish.x &&
        player.y < finish.y + finish.height &&
        player.y + player.height > finish.y) {
      currentLevel++;
      if (currentLevel >= levels.length) {
        alert('You beat all the levels!');
        currentLevel = 0;
      }
      resetPlayer();
    }

    // Death by falling
    if (player.y > canvas.height) {
      resetPlayer();
    }
  }

  function updateMovingPlatforms() {
    for (const mp of levels[currentLevel].movingPlatforms) {
      mp.update();
    }
  }

  function drawLevel() {
    const level = levels[currentLevel];
    // Background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Platforms
    ctx.fillStyle = '#888';
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

    // Player
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  function gameLoop() {
    updatePlayer();
    updateMovingPlatforms();
    drawLevel();
    requestAnimationFrame(gameLoop);
  }

  resetPlayer();
  gameLoop();
};
