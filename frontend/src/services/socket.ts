import { io } from 'socket.io-client';

const resolveSocketUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

    if (apiUrl && apiUrl.trim().length > 0) {
        // Strip trailing /api to get the server root (e.g. https://api.example.com)
        return apiUrl.trim().replace(/\/api\/?$/, '');
    }

    return 'http://localhost:5001';
};

const socket = io(resolveSocketUrl(), {
    autoConnect: false,
    withCredentials: true,
});

socket.on('connect', () => {
    console.log('[socket] connected  id=', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected reason=', reason);
});

socket.on('connect_error', (err) => {
    console.warn('[socket] connection error:', err.message);
});

export { socket };
