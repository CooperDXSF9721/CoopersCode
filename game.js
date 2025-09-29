// Platformer Game Script
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let levels = [
  {
    platforms: [
      {x: 50, y: 350, width: 100, height: 10},
      {x: 200, y: 300, width: 100, height: 10},
      {x: 350, y: 250, width: 100, height: 10},
      {x: 500, y: 200, width: 100, height: 10}
    ],
    hazards: [
      {x: 150, y: 360, width: 50, height: 40},
      {x: 400, y: 260, width: 50, height: 40}
    ],
    finish: {x: 600, y: 150, width: 40, height: 10}
  },
  {
    platforms: [
      {x: 50, y: 350, width: 80, height: 10},
      {x: 160, y: 300, width: 80, height: 10},
      {x: 270, y: 250, width: 80, height: 10},
      {x: 400, y: 200, width: 80, height: 10},
      {x: 550, y: 150, width: 80, height: 10}
    ],
    hazards: [
      {x: 100, y: 360, width: 50, height: 40},
      {x: 300, y: 260, width: 50, height: 40},
      {x: 450, y: 210, width: 50, height: 40}
    ],
    finish: {x: 600, y: 100, width: 40, height: 10}
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

function gameLoop(){
  const level = levels[currentLevel];
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Gravity
  player.dy += 0.5;
  if(player.dy > 10) player.dy = 10; // max fall speed
  player.onGround = false;

  // Horizontal movement
  player.dx = 0;
  if(keys.left) player.dx = -3;
  if(keys.right) player.dx = 3;

  // Apply movement
  player.x += player.dx;
  player.y += player.dy;

  // Platform collisions
  level.platforms.forEach(p => {
    // horizontal overlap
    if(player.x + player.width > p.x && player.x < p.x + p.width){
      // check vertical collision (landing on top)
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

  // Hazards
  let dead = false;
  level.hazards.forEach(h=>{
    if(player.x + player.width > h.x && player.x < h.x + h.width &&
       player.y + player.height > h.y && player.y < h.y + h.height){
      dead = true;
    }
  });
  if(dead || player.y > canvas.height){
    // reset
    player.x = 50;
    player.y = 300;
    player.dx = 0;
    player.dy = 0;
  }

  // Finish
  const f = level.finish;
  if(player.x + player.width > f.x && player.x < f.x + f.width &&
     player.y + player.height > f.y && player.y < f.y + f.height){
    currentLevel++;
    if(currentLevel >= levels.length){
      alert('You Win All Levels!');
      currentLevel = 0;
    }
    // reset player
    player.x = 50;
    player.y = 300;
    player.dx = 0;
    player.dy = 0;
  }

  // Draw platforms
  ctx.fillStyle = 'green';
  level.platforms.forEach(p => ctx.fillRect(p.x,p.y,p.width,p.height));

  // Draw hazards
  ctx.fillStyle = 'red';
  level.hazards.forEach(h => ctx.fillRect(h.x,h.y,h.width,h.height));

  // Draw finish
  ctx.fillStyle = 'gold';
  ctx.fillRect(f.x,f.y,f.width,f.height);

  // Draw player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x,player.y,player.width,player.height);

  requestAnimationFrame(gameLoop);
}

gameLoop();
