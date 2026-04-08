import mongoose, { type HydratedDocument, type Types } from 'mongoose';

const TICKET_STATUSES = ['Todo', 'In Progress', 'Done'] as const;
type TicketStatus = (typeof TICKET_STATUSES)[number];

const TICKET_PRIORITIES = ['Low', 'Medium', 'High'] as const;
type TicketPriority = (typeof TICKET_PRIORITIES)[number];

interface TicketAttributes {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  tags: string[];
  estimatedTime: string;
  createdBy: Types.ObjectId;
  assignedTo: Types.ObjectId | null;
  createdAt: Date;
}

type TicketDocument = HydratedDocument<TicketAttributes>;

const ticketSchema = new mongoose.Schema<TicketAttributes>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: TICKET_STATUSES,
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: TICKET_PRIORITIES,
    default: 'Medium'
  },
  tags: {
    type: [
      {
        type: String,
        trim: true
      }
    ],
    default: []
  },
  estimatedTime: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Ticket = mongoose.model<TicketAttributes>('Ticket', ticketSchema);

export { Ticket, TICKET_PRIORITIES, TICKET_STATUSES };
export type { TicketAttributes, TicketDocument, TicketPriority, TicketStatus };
