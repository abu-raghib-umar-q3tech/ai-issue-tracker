import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { type TicketDocument } from '../models/ticket.model.js';
import { analyzeTicket } from '../services/ai.service.js';
import { createTicket, deleteTicket, getTicketById, listTickets, updateTicket } from '../services/ticket.service.js';
import type { MessageResponse } from '../types/http.js';
import {
  isTicketPriority,
  isTicketStatus,
  type AnalyzeTicketRequestBody,
  type CreateTicketRequestBody,
  type GetTicketsQueryParams,
  type TicketAnalysisResult,
  type TicketListResponse,
  type TicketRouteParams,
  type UpdateTicketRequestBody
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
    const search =
      typeof req.query.search === 'string' && req.query.search.trim() ? req.query.search.trim() : undefined;

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
      search,
      userId,
      role
    });

    res.status(200).json(response);
  }
);

const updateTicketHandler = asyncHandler(
  async (
    req: Request<TicketRouteParams, TicketDocument | MessageResponse, UpdateTicketRequestBody>,
    res: Response<TicketDocument | MessageResponse>
  ): Promise<void> => {
    const { title, description, status, priority, tags, estimatedTime, assignedTo } = req.body;

    if (
      title === undefined &&
      description === undefined &&
      status === undefined &&
      priority === undefined &&
      tags === undefined &&
      estimatedTime === undefined &&
      assignedTo === undefined
    ) {
      res.status(400).json({ message: 'No updatable fields provided' });
      return;
    }

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      res.status(400).json({ message: 'title must be a non-empty string' });
      return;
    }

    if (description !== undefined && (typeof description !== 'string' || !description.trim())) {
      res.status(400).json({ message: 'description must be a non-empty string' });
      return;
    }

    if (status !== undefined && !isTicketStatus(status)) {
      res.status(400).json({ message: 'Invalid ticket status' });
      return;
    }

    if (priority !== undefined && !isTicketPriority(priority)) {
      res.status(400).json({ message: 'Invalid ticket priority' });
      return;
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags) || tags.some((t) => typeof t !== 'string')) {
        res.status(400).json({ message: 'tags must be an array of strings' });
        return;
      }
    }

    if (estimatedTime !== undefined && (typeof estimatedTime !== 'string' || !estimatedTime.trim())) {
      res.status(400).json({ message: 'estimatedTime must be a non-empty string' });
      return;
    }

    if (assignedTo !== undefined && (typeof assignedTo !== 'string' || !Types.ObjectId.isValid(assignedTo))) {
      res.status(400).json({ message: 'assignedTo must be a valid user id' });
      return;
    }

    const userId = req.user?.sub;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const ticket = await updateTicket(req.params.id, req.body, userId, role);

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  }
);

const getTicketByIdHandler = asyncHandler(
  async (
    req: Request<TicketRouteParams, TicketDocument | MessageResponse, never>,
    res: Response<TicketDocument | MessageResponse>
  ): Promise<void> => {
    const userId = req.user?.sub;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const ticket = await getTicketById(req.params.id);

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    // After .populate(), these fields are Documents not raw ObjectIds —
    // always use ._id.toString() to get the reliable hex string.
    const createdById = (ticket.createdBy as unknown as { _id: { toString(): string } })?._id?.toString()
      ?? ticket.createdBy.toString();
    const assignedToId = (ticket.assignedTo as unknown as { _id: { toString(): string } } | null)?._id?.toString()
      ?? ticket.assignedTo?.toString()
      ?? null;

    const isOwner = createdById === userId;
    const isAssigned = assignedToId === userId;

    if (role !== 'admin' && !isOwner && !isAssigned) {
      res.status(403).json({ message: 'Forbidden: you do not have access to this ticket' });
      return;
    }

    res.status(200).json(ticket);
  }
);

const analyzeTicketHandler = asyncHandler(
  async (
    req: Request<{}, TicketAnalysisResult | MessageResponse, AnalyzeTicketRequestBody>,
    res: Response<TicketAnalysisResult | MessageResponse>
  ): Promise<void> => {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ message: 'title must be a non-empty string' });
      return;
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ message: 'description must be a non-empty string' });
      return;
    }

    const result = await analyzeTicket(title.trim(), description.trim());
    res.status(200).json(result);
  }
);

const deleteTicketHandler = asyncHandler(
  async (
    req: Request<TicketRouteParams, TicketDocument | MessageResponse, never>,
    res: Response<TicketDocument | MessageResponse>
  ): Promise<void> => {
    const userId = req.user?.sub;
    const role = req.user?.role;

    if (!userId || !role) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const ticket = await deleteTicket(req.params.id, userId, role);

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    res.status(200).json({ message: 'Ticket deleted successfully' });
  }
);

export { analyzeTicketHandler, createTicketHandler, deleteTicketHandler, getTicketByIdHandler, getTicketsHandler, updateTicketHandler };
