const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos estáticos da pasta public
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    socket.on('join-room', (roomID) => {
        socket.join(roomID);
        // Informa aos outros usuários na sala que um novo participante entrou
        socket.to(roomID).emit('user-joined', socket.id);

        socket.on('offer', (payload) => {
            io.to(payload.target).emit('offer', {
                signal: payload.signal,
                callerID: socket.id
            });
        });

        socket.on('answer', (payload) => {
            io.to(payload.target).emit('answer', {
                signal: payload.signal,
                id: socket.id
            });
        });

        socket.on('ice-candidate', (incoming) => {
            io.to(incoming.target).emit('ice-candidate', {
                candidate: incoming.candidate,
                id: socket.id
            });
        });

        socket.on('disconnect', () => {
            socket.to(roomID).emit('user-disconnected', socket.id);
            console.log(`Usuário desconectado: ${socket.id}`);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});