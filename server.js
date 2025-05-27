const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

let players = {};

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    players[socket.id] = { id: socket.id, x: 0, y: 0, z: 0 };

    socket.emit('playerData', {
        id: socket.id,
        players: players
    });

    socket.broadcast.emit('playerJoined', players[socket.id]);

    socket.on('positionUpdate', (data) => {
        if (players[data.id]) {
            players[data.id] = { ...players[data.id], x: data.x, y: data.y, z: data.z };
            socket.broadcast.emit('playerMoved', data);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('killPlayer', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
