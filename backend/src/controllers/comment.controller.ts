import type { Request, Response } from 'express';
import { createComment, getCommentsByTicket } from '../services/comment.service.js';
import type { MessageResponse } from '../types/http.js';
import type {
    CommentListResponse,
    CommentRouteParams,
    CreateCommentRequestBody
} from '../types/comment.js';
import type { CommentDocument } from '../models/comment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createCommentHandler = asyncHandler(
    async (
        req: Request<{}, CommentDocument | MessageResponse, CreateCommentRequestBody>,
        res: Response<CommentDocument | MessageResponse>
    ): Promise<void> => {
        const userId = req.user?.sub;
        const role = req.user?.role;

        if (!userId || !role) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        if (!req.body.text || typeof req.body.text !== 'string' || !req.body.text.trim()) {
            res.status(400).json({ message: 'text must be a non-empty string' });
            return;
        }

        if (!req.body.ticketId || typeof req.body.ticketId !== 'string') {
            res.status(400).json({ message: 'ticketId is required' });
            return;
        }

        const comment = await createComment(req.body, userId, role);
        res.status(201).json(comment);
    }
);

const getCommentsByTicketHandler = asyncHandler(
    async (
        req: Request<CommentRouteParams, CommentListResponse | MessageResponse, never>,
        res: Response<CommentListResponse | MessageResponse>
    ): Promise<void> => {
        if (!req.user?.sub) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const comments = await getCommentsByTicket(req.params.ticketId);
        res.status(200).json(comments);
    }
);

export { createCommentHandler, getCommentsByTicketHandler };
