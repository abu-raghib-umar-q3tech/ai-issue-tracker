import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { issueRouter } from './issue.routes.js';
import { ticketRouter } from './ticket.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/issues', issueRouter);
apiRouter.use('/tickets', ticketRouter);

export { apiRouter };
