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
let player = {x: 50, y: 300, width: 30, height: 30, dx: 0, dy: 0, onGround:false};
const keys = {left:false,right:false,up:false};

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

  // gravity
  player.dy += 0.5;
  player.onGround = false;

  // horizontal movement
  if(keys.left) player.dx = -3;
  else if(keys.right) player.dx = 3;
  else player.dx = 0;

  // jumping
  if(keys.up && player.onGround) {
    player.dy = -10;
  }

  player.x += player.dx;
  player.y += player.dy;

  // collisions with platforms
  level.platforms.forEach(p=>{
    if(player.x + player.width > p.x && player.x < p.x + p.width &&
       player.y + player.height > p.y && player.y + player.height < p.y + p.height + 10 &&
       player.dy >=0){
      player.y = p.y - player.height;
      player.dy = 0;
      player.onGround = true;
    }
  });

  // collisions with hazards
  let dead = false;
  level.hazards.forEach(h=>{
    if(player.x + player.width > h.x && player.x < h.x + h.width &&
       player.y + player.height > h.y && player.y < h.y + h.height){
      dead = true;
    }
  });
  if(dead || player.y>canvas.height){
    player.x = 50;
    player.y = 300;
    player.dx=0;
    player.dy=0;
  }

  // check finish
  const f = level.finish;
  if(player.x + player.width > f.x && player.x < f.x + f.width &&
     player.y + player.height > f.y && player.y < f.y + f.height){
    currentLevel++;
    if(currentLevel>=levels.length){
      alert('You Win All Levels!');
      currentLevel=0;
    }
    player.x = 50;
    player.y = 300;
    player.dx=0;
    player.dy=0;
  }

  // draw platforms
  ctx.fillStyle = 'green';
  level.platforms.forEach(p=> ctx.fillRect(p.x,p.y,p.width,p.height));

  // draw hazards
  ctx.fillStyle = 'red';
  level.hazards.forEach(h=> ctx.fillRect(h.x,h.y,h.width,h.height));

  // draw finish
  ctx.fillStyle = 'gold';
  ctx.fillRect(f.x,f.y,f.width,f.height);

  // draw player
  ctx.fillStyle = 'blue';
  ctx.fillRect(player.x,player.y,player.width,player.height);

  requestAnimationFrame(gameLoop);
}

gameLoop();
