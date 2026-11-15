const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const rooms = new Map();

app.use(express.static("public"));
app.get("/health", (_req, res) => res.json({ ok: true, service: "himitsu-signaling" }));

io.on("connection", socket => {
  socket.on("join-room", ({ room, name }) => {
    if (typeof room !== "string" || !/^[A-Z0-9]{3,12}$/i.test(room)) {
      socket.emit("error-message", "Código de sala inválido."); return;
    }
    room = room.toUpperCase();
    const prior = rooms.get(room) || new Map();
    const existing = [...prior.entries()].map(([id, p]) => ({ id, name: p.name }));
    socket.join(room);
    socket.data.room = room;
    socket.data.name = String(name || "Participante").slice(0, 32);
    prior.set(socket.id, { name: socket.data.name });
    rooms.set(room, prior);
    socket.emit("joined", { id: socket.id, participants: existing });
    socket.to(room).emit("peer-joined", { id: socket.id, name: socket.data.name });
    // The newcomer initiates offers to existing participants.
    existing.forEach(p => socket.emit("peer-info", { id: p.id, name: p.name }));
  });

  socket.on("signal", ({ to, data }) => {
    if (!socket.data.room || typeof to !== "string" || !data) return;
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("sharing", ({ sharing }) => {
    if (socket.data.room) socket.to(socket.data.room).emit("peer-info", {
      id: socket.id, name: socket.data.name, sharing: Boolean(sharing)
    });
  });

  socket.on("leave-room", () => leave(socket));
  socket.on("disconnect", () => leave(socket));
});

function leave(socket) {
  const room = socket.data.room;
  if (!room) return;
  socket.to(room).emit("peer-left", socket.id);
  const members = rooms.get(room);
  if (members) {
    members.delete(socket.id);
    if (members.size === 0) rooms.delete(room);
  }
  socket.leave(room);
  socket.data.room = null;
}

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Himitsu signaling server listening on :${port}`));
