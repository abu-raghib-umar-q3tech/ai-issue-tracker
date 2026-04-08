import { Types } from 'mongoose';
import { getIO } from '../config/socket.js';
import { Notification } from '../models/notification.model.js';

const createNotification = async (userId: string, message: string, ticketId: string): Promise<void> => {
    try {
        const notification = await Notification.create({
            userId: new Types.ObjectId(userId),
            message,
            ticketId: new Types.ObjectId(ticketId)
        });

        getIO().to(userId).emit('notification', {
            _id: notification._id.toString(),
            userId,
            message,
            ticketId,
            isRead: false,
            createdAt: notification.createdAt
        });
    } catch {
        // Notifications are non-critical; never let them break the caller
    }
};

export { createNotification };
