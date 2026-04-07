import { Router } from 'express';
import {
  analyzeTicketHandler,
  createTicketHandler,
  deleteTicketHandler,
  getTicketsHandler,
  updateTicketHandler
} from '../controllers/ticket.controller.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const ticketRouter = Router();

ticketRouter.post('/', authenticateUser, createTicketHandler);
ticketRouter.post('/analyze', authenticateUser, analyzeTicketHandler);
ticketRouter.get('/', authenticateUser, getTicketsHandler);
ticketRouter.put('/:id', authenticateUser, updateTicketHandler);
ticketRouter.delete('/:id', authenticateUser, deleteTicketHandler);

export { ticketRouter };
