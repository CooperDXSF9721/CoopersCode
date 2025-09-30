const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FLOOR_Y = canvas.height - 40; // lava height

// Utility: simple collision check
function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

// --- LEVELS ---
const levels = [
  // LEVEL 1: simple intro
  {
    platforms: [
      {x: 50,  y: 350, width: 100, height: 10},   // start
      {x: 300, y: 310, width: 100, height: 10},   // right
      {x: 150, y: 260, width: 100, height: 10},   // left
      {x: 350, y: 210, width: 100, height: 10},   // right
    ],
    walls: [],
    finish: {x: 380, y: 170, width: 50, height: 10}
  },

  // LEVEL 2: staircase climbing
  {
    platforms: [
      {x: 60,  y: 350, width: 100, height: 10},   // start
      {x: 300, y: 310, width: 100, height: 10},   // step 1
      {x: 120, y: 270, width: 100, height: 10},   // step 2
      {x: 330, y: 230, width: 100, height: 10},   // step 3
      {x: 150, y: 190, width: 100, height: 10},   // step 4
      {x: 380, y: 150, width: 100, height: 10},   // step 5
    ],
    walls: [],
    finish: {x: 400, y: 110, width: 50, height: 10}
  },

  // LEVEL 3: staircase up then drop down behind wall
  {
    platforms: [
      {x: 70,  y: 350, width: 100, height: 10},   // start
      {x: 300, y: 310, width: 100, height: 10},   // step 1
      {x: 130, y: 270, width: 100, height: 10},   // step 2
      {x: 340, y: 230, width: 100, height: 10},   // step 3
      {x: 160, y: 190, width: 100, height: 10},   // step 4
      {x: 400, y: 150, width: 100, height: 10},   // step 5

      {x: 450, y: 350, width: 100, height: 10},   // landing after drop
      {x: 550, y: 310, width: 100, height: 10},   // approach finish
    ],
    walls: [
      {x: 500, y: 220, width: 30, height: 130, holeY: 280, holeHeight: 40} // wall with hole
    ],
    finish: {x: 600, y: 270, width: 50, height: 10}
  },

  // LEVEL 4: tricky wall navigation
  {
    platforms: [
      {x: 60,  y: 350, width: 100, height: 10},   // start
      {x: 300, y: 310, width: 100, height: 10},   // right
      {x: 100, y: 270, width: 100, height: 10},   // left
      {x: 400, y: 230, width: 100, height: 10},   // right
      {x: 200, y: 190, width: 100, height: 10},   // left

      {x: 550, y: 350, width: 100, height: 10},   // after wall
      {x: 650, y: 310, width: 100, height: 10},   // near finish
    ],
    walls: [
      {x: 500, y: 200, width: 40, height: 200, holeY: 320, holeHeight: 40}, // must go under hole
    ],
    finish: {x: 700, y: 270, width: 50, height: 10}
  }
];

let currentLevel = 0;
let player = {x: 70, y: 300, width: 30, height: 30, dx: 0, dy: 0, onGround: false};
const keys = {left:false,right:false,up:false};

// --- INPUT ---
document.addEventListener('keydown', e=>{
  if(e.key==='a' || e.key==='ArrowLeft') keys.left=true;
  if(e.key==='d' || e.key==='ArrowRight') keys.right=true;
  if(e.key==='w' || e.key==='ArrowUp' || e.code==='Space') keys.up=true;
});
document.addEventListener('keyup', e=>{
  if(e.key==='a' || e.key==='ArrowLeft') keys.left=false;
  if(e.key==='d' || e.key==='ArrowRight') keys.right=false;
  if(e.key==='w' || e.key==='ArrowUp' || e.code==='Space') keys.up=false;
});

// --- FUNCTIONS ---
function resetPlayer(){
  player.x = 70;
  player.y = 300;
  player.dx = 0;
  player.dy = 0;
}

function handleCollisions(level){
  // Platform collisions
  player.onGround = false;
  level.platforms.forEach(p => {
    if(player.x + player.width > p.x && player.x < p.x + p.width){
      if(player.y + player.height > p.y && player.y + player.height - player.dy <= p.y){
        player.y = p.y - player.height;
        player.dy = 0;
        player.onGround = true;
      }
    }
  });

  // Wall collisions (solid parts only)
  level.walls.forEach(w => {
    // Top part of wall
    let topRect = {x:w.x, y:w.y, width:w.width, height:w.holeY - w.y};
    // Bottom part
    let bottomRect = {x:w.x, y:w.holeY + w.holeHeight, width:w.width, height:w.y + w.height - (w.holeY + w.holeHeight)};

    [topRect, bottomRect].forEach(part => {
      if(rectsOverlap(player, part)){
        // Push out horizontally (simplest)
        if(player.x + player.width/2 < part.x + part.width/2){
          player.x = part.x - player.width;
        } else {
          player.x = part.x + part.width;
        }
      }
    });
  });
}

function drawLevel(level){
  // Lava
  ctx.fillStyle = 'orangered';
  ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);

  // Pillars under platforms
  ctx.fillStyle = '#5B3A1B';
  level.platforms.forEach(p => {
    ctx.fillRect(p.x + p.width/2 - 5, p.y, 10, FLOOR_Y - p.y);
  });

  // Platforms
  ctx.fillStyle = 'green';
  level.platforms.forEach(p => ctx.fillRect(p.x,p.y,p.width,p.height));

  // Walls
  ctx.fillStyle = 'gray';
  level.walls.forEach(w => {
    // top part
    ctx.fillRect(w.x, w.y, w.width, w.holeY - w.y);
    // bottom part
    ctx.fillRect(w.x, w.holeY + w.holeHeight, w.width, w.y + w.height - (w.holeY + w.holeHeight));
  });

  // Finish
  const f = level.finish;
  ctx.fillStyle = 'gold';
  ctx.fillRect(f.x,f.y,f.width,f.height);
}

// --- GAME LOOP ---
function gameLoop(){
  const level = levels[currentLevel];
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Gravity
  player.dy += 0.5;
  if(player.dy > 10) player.dy = 10;

  // Movement
  player.dx = 0;
  if(keys.left) player.dx = -3;
  if(keys.right) player.dx = 3;

  player.x += player.dx;
  player.y += player.dy;

  // Lava death
  if(player.y + player.height > FLOOR_Y){
    resetPlayer();
  }

  // Collisions
  handleCollisions(level);

  // Jump
  if(keys.up && player.onGround){
    player.dy = -10;
    player.onGround = false;
  }

  // Finish
  if(rectsOverlap(player, level.finish)){
    currentLevel++;
    if(currentLevel >= levels.length){
      alert('🎉 You Beat All 4 Levels!');
      currentLevel = 0;
    }
    resetPlayer();
  }

  // Draw everything
  drawLevel(level);

  // Player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x,player.y,player.width,player.height);

  requestAnimationFrame(gameLoop);
}

resetPlayer();
gameLoop();
