import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { apiRouter } from './routes/index.js';

interface HealthResponse {
  status: 'ok';
}

const app = express();

app.use(
  cors({
    origin: env.clientUrl
  })
);
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
