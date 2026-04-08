import { Router } from 'express';
import { getActivityHandler } from '../controllers/activity.controller.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const activityRouter = Router();

activityRouter.get('/:ticketId', authenticateUser, getActivityHandler);

export { activityRouter };
