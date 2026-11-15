const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = new Map(); // roomCode -> Map(socketId -> {id, name})

io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);
    let currentRoom = null;
    let currentName = null;

    socket.on('join-room', ({ room, name }) => {
        currentRoom = room;
        currentName = name || 'Participante';
        socket.join(room);

        if (!rooms.has(room)) {
            rooms.set(room, new Map());
        }
        const roomUsers = rooms.get(room);

        // Avisa os outros que um novo participante entrou
        socket.to(room).emit('peer-joined', { id: socket.id, name: currentName });
        socket.to(room).emit('peer-info', { id: socket.id, name: currentName });

        // Monta a lista de quem já está na sala para o novo usuário
        const participants = [];
        roomUsers.forEach((userInfo) => {
            participants.push(userInfo);
        });

        // Adiciona o novo usuário na lista da sala
        roomUsers.set(socket.id, { id: socket.id, name: currentName });

        // Envia a confirmação e a lista atualizada para quem entrou
        socket.emit('joined', { id: socket.id, participants });
    });

    socket.on('signal', ({ to, data }) => {
        io.to(to).emit('signal', { from: socket.id, data });
    });

    socket.on('sharing', (payload) => {
        if (currentRoom) {
            socket.to(currentRoom).emit('sharing', { id: socket.id, ...payload });
        }
    });

    socket.on('disconnect', () => {
        if (currentRoom && rooms.has(currentRoom)) {
            const roomUsers = rooms.get(currentRoom);
            roomUsers.delete(socket.id);
            io.to(currentRoom).emit('peer-left', socket.id);
            if (roomUsers.size === 0) {
                rooms.delete(currentRoom);
            }
        }
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});