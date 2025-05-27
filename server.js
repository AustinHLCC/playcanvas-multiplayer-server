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

    socket.on('rotationUpdate', (data) => {
    players[data.id].rot = data.rot;
    socket.broadcast.emit('playerRotated', data);
});

socket.on('playerColorChange', (data) => {
    if (players[data.id]) {
        players[data.id].color = data.color;
        socket.broadcast.emit('playerColorChanged', data);
    }
});

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
