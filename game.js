// Platformer Game Script
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FLOOR_Y = canvas.height - 40; // floor height for lava

let levels = [
  {
    platforms: [
      {x: 50,  y: 350, width: 100, height: 10},  // start left
      {x: 400, y: 310, width: 100, height: 10},  // far right
      {x: 200, y: 270, width: 100, height: 10},  // middle
      {x: 500, y: 230, width: 100, height: 10},  // right again
      {x: 100, y: 190, width: 100, height: 10},  // left
      {x: 350, y: 150, width: 100, height: 10},  // center-right
    ],
    finish: {x: 600, y: 110, width: 40, height: 10}
  },
  {
    platforms: [
      {x: 100, y: 350, width: 80, height: 10},
      {x: 500, y: 320, width: 100, height: 10},
      {x: 250, y: 280, width: 100, height: 10},
      {x: 450, y: 240, width: 100, height: 10},
      {x: 150, y: 200, width: 100, height: 10},
      {x: 400, y: 160, width: 100, height: 10},
      {x: 250, y: 120, width: 100, height: 10}
    ],
    finish: {x: 580, y: 80, width: 40, height: 10}
  }
];

let currentLevel = 0;
let player = {x: 50, y: 300, width: 30, height: 30, dx: 0, dy: 0, onGround: false};
const keys = {left:false,right:false,up:false};

// Keyboard input
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

function resetPlayer(){
  player.x = 60;
  player.y = 300;
  player.dx = 0;
  player.dy = 0;
}

function gameLoop(){
  const level = levels[currentLevel];
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Gravity
  player.dy += 0.5;
  if(player.dy > 10) player.dy = 10;
  player.onGround = false;

  // Horizontal movement
  player.dx = 0;
  if(keys.left) player.dx = -3;
  if(keys.right) player.dx = 3;

  // Apply movement
  player.x += player.dx;
  player.y += player.dy;

  // Floor Lava
  ctx.fillStyle = 'orangered';
  ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);

  // Check collision with floor lava
  if(player.y + player.height > FLOOR_Y){
    resetPlayer();
  }

  // Platform collisions
  level.platforms.forEach(p => {
    // top collision
    if(player.x + player.width > p.x && player.x < p.x + p.width){
      if(player.y + player.height > p.y && player.y + player.height - player.dy <= p.y){
        player.y = p.y - player.height;
        player.dy = 0;
        player.onGround = true;
      }
    }
  });

  // Jumping
  if(keys.up && player.onGround){
    player.dy = -10;
    player.onGround = false;
  }

  // Finish line
  const f = level.finish;
  if(player.x + player.width > f.x && player.x < f.x + f.width &&
     player.y + player.height > f.y && player.y < f.y + f.height){
    currentLevel++;
    if(currentLevel >= levels.length){
      alert('🎉 You Win All Levels!');
      currentLevel = 0;
    }
    resetPlayer();
  }

  // Draw pillars under platforms
  ctx.fillStyle = '#5B3A1B';
  level.platforms.forEach(p => {
    ctx.fillRect(p.x + p.width/2 - 5, p.y, 10, FLOOR_Y - p.y);
  });

  // Draw platforms
  ctx.fillStyle = 'green';
  level.platforms.forEach(p => ctx.fillRect(p.x,p.y,p.width,p.height));

  // Draw finish
  ctx.fillStyle = 'gold';
  ctx.fillRect(f.x,f.y,f.width,f.height);

  // Draw player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x,player.y,player.width,player.height);

  requestAnimationFrame(gameLoop);
}

resetPlayer();
gameLoop();
