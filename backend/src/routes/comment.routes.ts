import { Router } from 'express';
import { createCommentHandler, getCommentsByTicketHandler } from '../controllers/comment.controller.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const commentRouter = Router();

commentRouter.post('/', authenticateUser, createCommentHandler);
commentRouter.get('/:ticketId', authenticateUser, getCommentsByTicketHandler);

export { commentRouter };
