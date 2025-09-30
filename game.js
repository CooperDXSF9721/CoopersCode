const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FLOOR_Y = canvas.height - 40; // lava height

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

// Levels
const levels = [
  {
    // Level 1 (intro)
    platforms: [
      {x: 50,  y: 350, width: 100, height: 10},
      {x: 300, y: 310, width: 100, height: 10},
      {x: 150, y: 260, width: 100, height: 10},
      {x: 350, y: 210, width: 100, height: 10},
    ],
    walls: [],
    finish: {x: 380, y: 170, width: 50, height: 10}
  },
  {
    // Level 2 (staircase)
    platforms: [
      {x: 60,  y: 350, width: 100, height: 10},
      {x: 300, y: 310, width: 100, height: 10},
      {x: 120, y: 270, width: 100, height: 10},
      {x: 330, y: 230, width: 100, height: 10},
      {x: 150, y: 190, width: 100, height: 10},
      {x: 380, y: 150, width: 100, height: 10},
    ],
    walls: [],
    finish: {x: 400, y: 110, width: 50, height: 10}
  },
  {
    // Level 3 (staircase + wall with hole)
    platforms: [
      {x: 70,  y: 350, width: 100, height: 10},
      {x: 300, y: 310, width: 100, height: 10},
      {x: 130, y: 270, width: 100, height: 10},
      {x: 340, y: 230, width: 100, height: 10},
      {x: 160, y: 190, width: 100, height: 10},
      {x: 400, y: 150, width: 100, height: 10},
      {x: 500, y: 350, width: 100, height: 10},
      {x: 620, y: 310, width: 100, height: 10}
    ],
    walls: [
      {x: 460, width: 40, holeY: 250, holeHeight: 70} // floor to ceiling
    ],
    finish: {x: 660, y: 270, width: 50, height: 10}
  },
  {
    // Level 4 (wall navigation)
    platforms: [
      {x: 60,  y: 350, width: 100, height: 10},
      {x: 300, y: 310, width: 100, height: 10},
      {x: 100, y: 270, width: 100, height: 10},
      {x: 400, y: 230, width: 100, height: 10},
      {x: 200, y: 190, width: 100, height: 10},
      {x: 600, y: 350, width: 100, height: 10},
      {x: 700, y: 310, width: 100, height: 10},
    ],
    walls: [
      {x: 500, width: 40, holeY: 300, holeHeight: 80} // bigger hole
    ],
    finish: {x: 740, y: 270, width: 50, height: 10}
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
  player.onGround = false;

  // Platforms
  level.platforms.forEach(p => {
    if(player.x + player.width > p.x && player.x < p.x + p.width){
      // Landing from above
      if(player.y + player.height > p.y && player.y + player.height - player.dy <= p.y){
        player.y = p.y - player.height;
        player.dy = 0;
        player.onGround = true;
      }
      // Hitting head from below (no going through)
      else if(player.y < p.y + p.height && player.y - player.dy >= p.y + p.height){
        player.y = p.y + p.height;
        player.dy = 0;
      }
    }
  });

  // Walls (floor-to-ceiling)
  level.walls.forEach(w => {
    const topPart = {x:w.x, y:0, width:w.width, height:w.holeY};
    const bottomPart = {x:w.x, y:w.holeY + w.holeHeight, width:w.width, height:canvas.height - (w.holeY + w.holeHeight)};
    [topPart, bottomPart].forEach(part=>{
      if(rectsOverlap(player, part)){
        // horizontal push
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

  // Pillars
  ctx.fillStyle = '#5B3A1B';
  level.platforms.forEach(p=>{
    ctx.fillRect(p.x + p.width/2 - 5, p.y, 10, FLOOR_Y - p.y);
  });

  // Platforms
  ctx.fillStyle = 'green';
  level.platforms.forEach(p => ctx.fillRect(p.x,p.y,p.width,p.height));

  // Walls
  ctx.fillStyle = 'gray';
  level.walls.forEach(w=>{
    // top section
    ctx.fillRect(w.x, 0, w.width, w.holeY);
    // bottom section
    ctx.fillRect(w.x, w.holeY + w.holeHeight, w.width, canvas.height - (w.holeY + w.holeHeight));
  });

  // Finish
  ctx.fillStyle = 'gold';
  const f = level.finish;
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

  // Lava
  if(player.y + player.height > FLOOR_Y){
    resetPlayer();
  }

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
      alert('🎉 You beat all 4 levels!');
      currentLevel = 0;
    }
    resetPlayer();
  }

  drawLevel(level);

  // Player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x,player.y,player.width,player.height);

  requestAnimationFrame(gameLoop);
}

resetPlayer();
gameLoop();
