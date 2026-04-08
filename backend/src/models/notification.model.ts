import mongoose, { type HydratedDocument, type Types } from 'mongoose';

interface NotificationAttributes {
    userId: Types.ObjectId;
    message: string;
    ticketId: Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
}

type NotificationDocument = HydratedDocument<NotificationAttributes>;

const notificationSchema = new mongoose.Schema<NotificationAttributes>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model<NotificationAttributes>('Notification', notificationSchema);

export { Notification };
export type { NotificationAttributes, NotificationDocument };
