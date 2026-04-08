import { Router } from 'express';
import {
  analyzeTicketHandler,
  createTicketHandler,
  deleteTicketHandler,
  getTicketByIdHandler,
  getTicketsHandler,
  updateTicketHandler
} from '../controllers/ticket.controller.js';
import { authenticateUser } from '../middleware/authenticateUser.js';

const ticketRouter = Router();

ticketRouter.post('/', authenticateUser, createTicketHandler);
ticketRouter.post('/analyze', authenticateUser, analyzeTicketHandler);
ticketRouter.get('/', authenticateUser, getTicketsHandler);
ticketRouter.get('/:id', authenticateUser, getTicketByIdHandler);
ticketRouter.put('/:id', authenticateUser, updateTicketHandler);
ticketRouter.delete('/:id', authenticateUser, deleteTicketHandler);

export { ticketRouter };
