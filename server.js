const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let players = {};

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    players[socket.id] = {
        id: socket.id,
        x: 0, y: 0, z: 0,
        rot: { x: 0, y: 0, z: 0 },
        color: { r: 1, g: 1, b: 1 }
    };

    socket.emit('playerData', {
        id: socket.id,
        players: players
    });

    socket.broadcast.emit('playerJoined', players[socket.id]);

    socket.on('positionUpdate', (data) => {
        if (players[data.id]) {
            players[data.id].x = data.x;
            players[data.id].y = data.y;
            players[data.id].z = data.z;
            socket.broadcast.emit('playerMoved', data);
        }
    });

    socket.on('rotationUpdate', (data) => {
        if (players[data.id]) {
            players[data.id].rot = data.rot;
            socket.broadcast.emit('playerRotated', data);
        }
    });

    socket.on('playerColorChange', (data) => {
        if (players[data.id]) {
            players[data.id].color = data.color;
            socket.broadcast.emit('playerColorChanged', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        io.emit('killPlayer', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Multiplayer server running at http://localhost:${PORT}`);
});
