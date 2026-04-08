import type { CommentDocument } from '../models/comment.model.js';

interface CreateCommentRequestBody {
    text: string;
    ticketId: string;
}

interface CommentRouteParams {
    ticketId: string;
}

type CommentListResponse = CommentDocument[];

export type { CommentListResponse, CommentRouteParams, CreateCommentRequestBody };
