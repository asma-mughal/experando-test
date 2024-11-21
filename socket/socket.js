import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', "*"],
        methods: ['GET', 'POST'],
    },
});

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));
    socket.on('sendNotification', ({ receiverId, message }) => {
        try {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('sendNotification', {
                    receiverId,
                    message,
                });
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    });

    socket.on('disconnect', () => {
        if (userId) {
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { app, io, server };
