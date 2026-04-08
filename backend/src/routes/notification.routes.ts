import { Router } from 'express';
import {
    getNotificationsHandler,
    markAllNotificationsReadHandler,
    markNotificationReadHandler
} from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const notificationRouter = Router();

notificationRouter.get('/', authenticateUser, getNotificationsHandler);
notificationRouter.put('/read-all', authenticateUser, markAllNotificationsReadHandler);
notificationRouter.put('/:id/read', authenticateUser, markNotificationReadHandler);

export { notificationRouter };
