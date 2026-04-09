import { Router } from 'express';
import { activityRouter } from './activity.routes.js';
import { authRouter } from './auth.routes.js';
import { commentRouter } from './comment.routes.js';
import { notificationRouter } from './notification.routes.js';
import { ticketRouter } from './ticket.routes.js';
import { userRouter } from './user.routes.js';

const apiRouter = Router();

apiRouter.use('/activity', activityRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/comments', commentRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/tickets', ticketRouter);
apiRouter.use('/users', userRouter);

export { apiRouter };
