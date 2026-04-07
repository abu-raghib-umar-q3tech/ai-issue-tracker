import { type FilterQuery, Types } from 'mongoose';
import { Ticket, type TicketAttributes, type TicketDocument } from '../models/ticket.model.js';
import { analyzeTicket } from './ai.service.js';
import type {
  CreateTicketInput,
  CreateTicketRequestBody,
  ListTicketsFilters,
  TicketListResponse,
  UpdateTicketRequestBody
} from '../types/ticket.js';
import type { AppError } from '../types/http.js';

const makeAppError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeTag = (tag: string): string => tag.trim().toLowerCase().replace(/\s+/g, '-');

const mergeTags = (providedTags: string[] | undefined, aiTags: string[]): string[] => {
  const merged = [...(providedTags ?? []), ...aiTags].map((tag) => normalizeTag(tag)).filter(Boolean);
  const unique = [...new Set(merged)];
  return unique.length ? unique : ['general'];
};

const createTicket = async (payload: CreateTicketRequestBody, userId: string): Promise<TicketDocument> => {
  const title = payload.title?.trim();
  const description = payload.description?.trim();

  if (!title || !description) {
    throw makeAppError('Title and description are required', 400);
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw makeAppError('Invalid authenticated user', 401);
  }

  const analysis = await analyzeTicket(title, description);

  const createInput: CreateTicketInput = {
    title,
    description,
    status: payload.status ?? 'Todo',
    priority: payload.priority ?? analysis.priority,
    tags: mergeTags(payload.tags, analysis.tags),
    estimatedTime: payload.estimatedTime?.trim() || analysis.estimatedTime,
    createdBy: new Types.ObjectId(userId)
  };

  const ticket = await Ticket.create(createInput);
  return ticket;
};

const listTickets = async (filters: ListTicketsFilters): Promise<TicketListResponse> => {
  const query: FilterQuery<TicketAttributes> = {};

  if (filters.role !== 'admin') {
    query.createdBy = new Types.ObjectId(filters.userId);
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ title: regex }, { description: regex }];
  }

  const skip = (filters.page - 1) * filters.limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(query).sort({ createdAt: -1 }).skip(skip).limit(filters.limit).exec(),
    Ticket.countDocuments(query)
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / filters.limit);

  return {
    tickets,
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages
  };
};

const updateTicket = async (
  ticketId: string,
  payload: UpdateTicketRequestBody,
  requestingUserId: string,
  requestingUserRole: string
): Promise<TicketDocument | null> => {
  if (!Types.ObjectId.isValid(ticketId)) {
    throw makeAppError('Invalid ticket id', 400);
  }

  const existing = await Ticket.findById(ticketId).exec();

  if (!existing) {
    return null;
  }

  if (requestingUserRole !== 'admin' && existing.createdBy.toString() !== requestingUserId) {
    throw makeAppError('Forbidden: you do not own this ticket', 403);
  }

  const updates: Partial<TicketAttributes> = {};

  if (payload.title !== undefined) updates.title = payload.title.trim();
  if (payload.description !== undefined) updates.description = payload.description.trim();
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.priority !== undefined) updates.priority = payload.priority;
  if (payload.tags !== undefined) updates.tags = payload.tags.map(normalizeTag).filter(Boolean);
  if (payload.estimatedTime !== undefined) updates.estimatedTime = payload.estimatedTime.trim();

  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    updates,
    { new: true, runValidators: true }
  ).exec();

  return ticket;
};

const deleteTicket = async (
  ticketId: string,
  requestingUserId: string,
  requestingUserRole: string
): Promise<TicketDocument | null> => {
  if (!Types.ObjectId.isValid(ticketId)) {
    throw makeAppError('Invalid ticket id', 400);
  }

  const existing = await Ticket.findById(ticketId).exec();

  if (!existing) {
    return null;
  }

  if (requestingUserRole !== 'admin' && existing.createdBy.toString() !== requestingUserId) {
    throw makeAppError('Forbidden: you do not own this ticket', 403);
  }

  await Ticket.findByIdAndDelete(ticketId).exec();
  return existing;
};

export { createTicket, deleteTicket, listTickets, updateTicket };
