export type TicketStatus = 'Todo' | 'In Progress' | 'Done';

export type TicketPriority = 'Low' | 'Medium' | 'High';

export interface UserRef {
  _id: string;
  name: string;
  email: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  tags: string[];
  estimatedTime: string;
  createdBy: UserRef;
  assignedTo: UserRef | null;
  createdAt: string;
}

export interface GetTicketsParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
}

export interface GetTicketsResponse {
  tickets: Ticket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  tags?: string[];
  estimatedTime?: string;
  assignedTo?: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  tags?: string[];
  estimatedTime?: string;
  assignedTo?: string;
}

export interface UpdateTicketPayload {
  id: string;
  data: UpdateTicketRequest;
}

export interface AnalyzeTicketRequest {
  title: string;
  description: string;
}

export interface TicketAnalysisResult {
  priority: TicketPriority;
  tags: string[];
  estimatedTime: string;
}
