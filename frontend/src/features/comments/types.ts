import type { User } from '../users/types';

export interface Comment {
    _id: string;
    text: string;
    userId: User;
    ticketId: string;
    createdAt: string;
}

export interface CreateCommentRequest {
    text: string;
    ticketId: string;
}
