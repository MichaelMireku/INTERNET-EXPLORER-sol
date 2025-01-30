const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const socket = io();

let players = {};
let bullets = [];
let explosions = [];
let myId = null;

// Load images
const playerSprite = new Image();
playerSprite.src = "player.png";

const bulletSprite = new Image();
bulletSprite.src = "bullet.png";

const explosionSprite = new Image();
explosionSprite.src = "explosion.png";

socket.on("init", (data) => {
  myId = data.id;
  players = data.players;
});

socket.on("update", (data) => {
  players = data.players;
  bullets = data.bullets;
});

document.addEventListener("keydown", (event) => {
  if (myId) {
    let moveData = { type: "move", id: myId, direction: null };
    if (event.key === "a") moveData.direction = "left";
    if (event.key === "d") moveData.direction = "right";
    if (event.key === "w") moveData.direction = "jump";
    if (event.key === " ") moveData.type = "shoot";
    socket.emit("playerAction", moveData);
  }
});

// Game loop with improved rendering
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw players
  Object.values(players).forEach((player) => {
    ctx.drawImage(playerSprite, player.x, player.y, 40, 40);
  });

  // Draw bullets
  bullets.forEach((bullet) => {
    ctx.drawImage(bulletSprite, bullet.x, bullet.y, 10, 10);
  });

  // Draw explosions
  explosions.forEach((explosion, index) => {
    ctx.drawImage(explosionSprite, explosion.x, explosion.y, 50, 50);
    explosion.timer--;
    if (explosion.timer <= 0) explosions.splice(index, 1);
  });

  requestAnimationFrame(gameLoop);
}

gameLoop();
