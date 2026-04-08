import mongoose, { type HydratedDocument, type Types } from 'mongoose';

interface CommentAttributes {
    text: string;
    userId: Types.ObjectId;
    ticketId: Types.ObjectId;
    createdAt: Date;
}

type CommentDocument = HydratedDocument<CommentAttributes>;

const commentSchema = new mongoose.Schema<CommentAttributes>({
    text: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Comment = mongoose.model<CommentAttributes>('Comment', commentSchema);

export { Comment };
export type { CommentAttributes, CommentDocument };
