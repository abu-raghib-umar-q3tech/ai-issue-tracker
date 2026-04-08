import { Router } from 'express';
import { getUsersHandler } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const userRouter = Router();

userRouter.get('/', authenticateUser, getUsersHandler);

export { userRouter };
