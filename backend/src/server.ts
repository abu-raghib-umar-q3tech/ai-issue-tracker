import { createServer } from 'node:http';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './config/socket.js';

const startServer = async (): Promise<void> => {
  await connectDB();

  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });

  httpServer.on('error', (error: NodeJS.ErrnoException) => {
    console.error(`Failed to bind port ${env.port}:`, error.message);
    process.exit(1);
  });
};

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error';
  console.error('Server startup failed:', message);
  process.exit(1);
});
