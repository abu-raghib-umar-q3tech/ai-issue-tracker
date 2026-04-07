import { type Types } from 'mongoose';
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketDocument,
  type TicketPriority,
  type TicketStatus
} from '../models/ticket.model.js';

interface CreateTicketRequestBody {
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  tags?: string[];
  estimatedTime?: string;
}

interface UpdateTicketRequestBody {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  tags?: string[];
  estimatedTime?: string;
}

interface AnalyzeTicketRequestBody {
  title: string;
  description: string;
}

interface TicketRouteParams {
  id: string;
}

interface GetTicketsQueryParams {
  page?: string;
  limit?: string;
  status?: string;
  priority?: string;
  search?: string;
}

interface ListTicketsFilters {
  page: number;
  limit: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  userId: string;
  role: string;
  search?: string;
}

interface TicketAnalysisResult {
  priority: TicketPriority;
  tags: string[];
  estimatedTime: string;
}

interface CreateTicketInput {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  tags: string[];
  estimatedTime: string;
  createdBy: Types.ObjectId;
}

interface TicketListResponse {
  tickets: TicketDocument[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const isTicketStatus = (value: unknown): value is TicketStatus => {
  return typeof value === 'string' && TICKET_STATUSES.includes(value as TicketStatus);
};

const isTicketPriority = (value: unknown): value is TicketPriority => {
  return typeof value === 'string' && TICKET_PRIORITIES.includes(value as TicketPriority);
};

export { isTicketPriority, isTicketStatus };

export type {
  AnalyzeTicketRequestBody,
  CreateTicketInput,
  CreateTicketRequestBody,
  GetTicketsQueryParams,
  ListTicketsFilters,
  TicketAnalysisResult,
  TicketListResponse,
  TicketRouteParams,
  UpdateTicketRequestBody
};
