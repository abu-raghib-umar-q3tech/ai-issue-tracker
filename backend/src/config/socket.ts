import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from './env.js';

let io: Server;

const initSocket = (httpServer: HttpServer): Server => {
    io = new Server(httpServer, {
        cors: {
            origin: env.clientUrl,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`[socket] client connected    id=${socket.id}`);

        socket.on('join', (userId: string) => {
            if (typeof userId === 'string' && userId.trim()) {
                void socket.join(userId);
                console.log(`[socket] ${socket.id} joined room=${userId}`);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log(`[socket] client disconnected id=${socket.id} reason=${reason}`);
        });
    });

    return io;
};

const getIO = (): Server => {
    if (!io) throw new Error('Socket.io has not been initialised. Call initSocket() first.');
    return io;
};

export { initSocket, getIO };
