import { Router } from 'express';
import {
  createTicketHandler,
  getTicketsHandler,
  updateTicketStatusHandler
} from '../controllers/ticket.controller.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const ticketRouter = Router();

ticketRouter.post('/', authenticateUser, createTicketHandler);
ticketRouter.get('/', authenticateUser, getTicketsHandler);
ticketRouter.put('/:id', authenticateUser, updateTicketStatusHandler);

export { ticketRouter };
