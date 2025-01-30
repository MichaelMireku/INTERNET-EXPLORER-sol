const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

const players = {};
const bullets = [];
const explosions = [];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

io.on("connection", (socket) => {
  const playerId = generateId();
  players[playerId] = {
    x: 100,
    y: 500,
    color: "#" + Math.floor(Math.random() * 16777215).toString(16),
  };

  socket.emit("init", { id: playerId, players });

  socket.on("playerAction", (data) => {
    if (data.type === "move") {
      if (data.direction === "left") players[data.id].x -= 5;
      if (data.direction === "right") players[data.id].x += 5;
      if (data.direction === "jump") players[data.id].y -= 10;
    }
    if (data.type === "shoot") {
      bullets.push({
        x: players[data.id].x,
        y: players[data.id].y,
        dx: 10,
        color: players[data.id].color,
      });
    }
  });

  setInterval(() => {
    bullets.forEach((bullet, index) => {
      bullet.x += bullet.dx;
      if (bullet.x > 1200 || bullet.x < 0) {
        explosions.push({ x: bullet.x, y: bullet.y, timer: 10 });
        bullets.splice(index, 1);
      }
    });

    io.emit("update", { players, bullets, explosions });
  }, 100);
});

server.listen(3000, () => console.log("Server running on port 3000"));
