import { type FilterQuery, Types } from 'mongoose';
import { Ticket, type TicketAttributes, type TicketDocument } from '../models/ticket.model.js';
import { User } from '../models/user.model.js';
import { analyzeTicket } from './ai.service.js';
import type {
  CreateTicketInput,
  CreateTicketRequestBody,
  ListTicketsFilters,
  TicketListResponse,
  UpdateTicketRequestBody
} from '../types/ticket.js';
import type { AppError } from '../types/http.js';
import { logActivity } from '../utils/logActivity.js';
import { createNotification } from '../utils/createNotification.js';
import { getIO } from '../config/socket.js';

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

  if (payload.assignedTo !== undefined && !Types.ObjectId.isValid(payload.assignedTo)) {
    throw makeAppError('Invalid assignedTo user id', 400);
  }

  const createInput: CreateTicketInput = {
    title,
    description,
    status: payload.status ?? 'Todo',
    priority: payload.priority ?? analysis.priority,
    tags: mergeTags(payload.tags, analysis.tags),
    estimatedTime: payload.estimatedTime?.trim() || analysis.estimatedTime,
    createdBy: new Types.ObjectId(userId),
    assignedTo: payload.assignedTo ? new Types.ObjectId(payload.assignedTo) : new Types.ObjectId(userId)
  };

  const ticket = await Ticket.create(createInput);
  const ticketId = ticket._id.toString();
  void logActivity(userId, ticketId, 'created this issue');
  getIO().emit('ticketCreated', { ticketId });

  // Notify assigned user if they are not the creator
  const assignedId = ticket.assignedTo?.toString();
  if (assignedId && assignedId !== userId) {
    void createNotification(assignedId, 'You have been assigned a new issue', ticketId);
  }

  return ticket;
};

const listTickets = async (filters: ListTicketsFilters): Promise<TicketListResponse> => {
  const query: FilterQuery<TicketAttributes> = {};

  if (filters.role !== 'admin') {
    const userObjectId = new Types.ObjectId(filters.userId);
    query.$or = [{ createdBy: userObjectId }, { assignedTo: userObjectId }];
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
    const searchCondition = { $or: [{ title: regex }, { description: regex }] };

    if (query.$or) {
      // combine ownership $or and search $or under $and
      query.$and = [{ $or: query.$or }, searchCondition];
      delete query.$or;
    } else {
      query.$or = [{ title: regex }, { description: regex }];
    }
  }

  const skip = (filters.page - 1) * filters.limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(filters.limit)
      .exec(),
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

const getTicketById = async (ticketId: string): Promise<TicketDocument | null> => {
  if (!Types.ObjectId.isValid(ticketId)) {
    throw makeAppError('Invalid ticket id', 400);
  }

  const ticket = await Ticket.findById(ticketId)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .exec();

  return ticket;
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

  const isAdmin = requestingUserRole === 'admin';
  const isCreator = existing.createdBy.toString() === requestingUserId;
  const isAssignee = existing.assignedTo?.toString() === requestingUserId;

  if (!isAdmin && !isCreator && !isAssignee) {
    throw makeAppError('Forbidden: you do not have access to this ticket', 403);
  }

  const updates: Partial<TicketAttributes> = {};

  if (payload.title !== undefined) updates.title = payload.title.trim();
  if (payload.description !== undefined) updates.description = payload.description.trim();
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.priority !== undefined) updates.priority = payload.priority;
  if (payload.tags !== undefined) updates.tags = payload.tags.map(normalizeTag).filter(Boolean);
  if (payload.estimatedTime !== undefined) updates.estimatedTime = payload.estimatedTime.trim();
  if (payload.assignedTo !== undefined) updates.assignedTo = new Types.ObjectId(payload.assignedTo);

  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    updates,
    { new: true, runValidators: true }
  ).exec();

  if (ticket) {
    getIO().emit('ticketUpdated', { ticketId });

    const creatorId = existing.createdBy.toString();
    const existingAssigneeId = existing.assignedTo?.toString();

    if (payload.status !== undefined && payload.status !== existing.status) {
      void logActivity(requestingUserId, ticketId, `changed status to ${payload.status}`);

      // Notify creator and assignee, excluding the user who made the change
      const message = `Status updated to ${payload.status}`;
      const notifyIds = new Set([creatorId, existingAssigneeId].filter(Boolean) as string[]);
      notifyIds.delete(requestingUserId);
      for (const recipientId of notifyIds) {
        void createNotification(recipientId, message, ticketId);
      }
    }

    if (payload.priority !== undefined && payload.priority !== existing.priority) {
      void logActivity(requestingUserId, ticketId, `updated priority to ${payload.priority}`);
    }

    if (payload.assignedTo !== undefined && payload.assignedTo !== existingAssigneeId) {
      const assignedUser = await User.findById(payload.assignedTo).lean().exec();
      const name = assignedUser?.name ?? payload.assignedTo;
      void logActivity(requestingUserId, ticketId, `assigned to ${name}`);

      // Notify the newly assigned user if they are not the one making the change
      if (payload.assignedTo !== requestingUserId) {
        void createNotification(payload.assignedTo, 'You have been assigned a new issue', ticketId);
      }
    }
  }

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

  const isAdmin = requestingUserRole === 'admin';
  const isCreator = existing.createdBy.toString() === requestingUserId;
  const isAssignee = existing.assignedTo?.toString() === requestingUserId;

  if (!isAdmin && !isCreator && !isAssignee) {
    throw makeAppError('Forbidden: you do not have access to this ticket', 403);
  }

  await Ticket.findByIdAndDelete(ticketId).exec();
  return existing;
};

export { createTicket, deleteTicket, getTicketById, listTickets, updateTicket };
