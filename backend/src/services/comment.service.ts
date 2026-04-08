import { Types } from 'mongoose';
import { Comment, type CommentDocument } from '../models/comment.model.js';
import { Ticket } from '../models/ticket.model.js';
import type { AppError } from '../types/http.js';
import type { CreateCommentRequestBody } from '../types/comment.js';
import { logActivity } from '../utils/logActivity.js';
import { createNotification } from '../utils/createNotification.js';
import { getIO } from '../config/socket.js';

const makeAppError = (message: string, statusCode: number): AppError => {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const createComment = async (
    payload: CreateCommentRequestBody,
    userId: string,
    userRole: string
): Promise<CommentDocument> => {
    const text = payload.text?.trim();

    if (!text) {
        throw makeAppError('text is required', 400);
    }

    if (!Types.ObjectId.isValid(payload.ticketId)) {
        throw makeAppError('Invalid ticketId', 400);
    }

    const ticket = await Ticket.findById(payload.ticketId).exec();

    if (!ticket) {
        throw makeAppError('Ticket not found', 404);
    }

    const isAdmin = userRole === 'admin';
    const isCreator = ticket.createdBy.toString() === userId;
    const isAssignee = ticket.assignedTo?.toString() === userId;

    if (!isAdmin && !isCreator && !isAssignee) {
        throw makeAppError('Forbidden: you do not have access to this ticket', 403);
    }

    const comment = await Comment.create({
        text,
        userId: new Types.ObjectId(userId),
        ticketId: new Types.ObjectId(payload.ticketId)
    });

    const populated = await comment.populate('userId', 'name email');
    const authorName = (populated.userId as unknown as { name: string }).name;
    void logActivity(userId, payload.ticketId, 'added a comment');
    getIO().emit('commentAdded', { ticketId: payload.ticketId });

    // Notify ticket creator and assignee, excluding the comment author
    const message = `${authorName} commented on your issue`;
    const creatorId = ticket.createdBy.toString();
    const assigneeId = ticket.assignedTo?.toString();
    const recipientIds = new Set([creatorId, assigneeId].filter(Boolean) as string[]);
    recipientIds.delete(userId);
    for (const recipientId of recipientIds) {
        void createNotification(recipientId, message, payload.ticketId);
    }

    return populated;
};

const getCommentsByTicket = async (ticketId: string): Promise<CommentDocument[]> => {
    if (!Types.ObjectId.isValid(ticketId)) {
        throw makeAppError('Invalid ticketId', 400);
    }

    const comments = await Comment.find({ ticketId: new Types.ObjectId(ticketId) })
        .populate('userId', 'name email')
        .sort({ createdAt: 1 })
        .exec();

    return comments;
};

export { createComment, getCommentsByTicket };
