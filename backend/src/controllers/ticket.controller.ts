import type { Request, Response } from 'express';
import { type TicketDocument } from '../models/ticket.model.js';
import { createTicket, listTickets, updateTicketStatus } from '../services/ticket.service.js';
import type { MessageResponse } from '../types/http.js';
import {
  isTicketPriority,
  isTicketStatus,
  type CreateTicketRequestBody,
  type GetTicketsQueryParams,
  type TicketListResponse,
  type TicketRouteParams,
  type UpdateTicketStatusRequestBody
} from '../types/ticket.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const createTicketHandler = asyncHandler(
  async (
    req: Request<{}, TicketDocument | MessageResponse, CreateTicketRequestBody>,
    res: Response<TicketDocument | MessageResponse>
  ): Promise<void> => {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const ticket = await createTicket(req.body, userId);
    res.status(201).json(ticket);
  }
);

const getTicketsHandler = asyncHandler(
  async (
    req: Request<{}, TicketListResponse | MessageResponse, never, GetTicketsQueryParams>,
    res: Response<TicketListResponse | MessageResponse>
  ): Promise<void> => {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 10);

    if (req.query.status && !isTicketStatus(req.query.status)) {
      res.status(400).json({ message: 'Invalid status query value' });
      return;
    }

    if (req.query.priority && !isTicketPriority(req.query.priority)) {
      res.status(400).json({ message: 'Invalid priority query value' });
      return;
    }

    const statusFilter = req.query.status && isTicketStatus(req.query.status) ? req.query.status : undefined;
    const priorityFilter = req.query.priority && isTicketPriority(req.query.priority) ? req.query.priority : undefined;

    const userId = req.user?.sub;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const response = await listTickets({
      page,
      limit,
      status: statusFilter,
      priority: priorityFilter,
      userId,
      role
    });

    res.status(200).json(response);
  }
);

const updateTicketStatusHandler = asyncHandler(
  async (
    req: Request<TicketRouteParams, TicketDocument | MessageResponse, UpdateTicketStatusRequestBody>,
    res: Response<TicketDocument | MessageResponse>
  ): Promise<void> => {
    if (!isTicketStatus(req.body.status)) {
      res.status(400).json({ message: 'Invalid ticket status' });
      return;
    }

    const ticket = await updateTicketStatus(req.params.id, {
      status: req.body.status
    });

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  }
);

export { createTicketHandler, getTicketsHandler, updateTicketStatusHandler };
