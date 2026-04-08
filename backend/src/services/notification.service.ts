import { Types } from 'mongoose';
import { Notification, type NotificationDocument } from '../models/notification.model.js';
import type { AppError } from '../types/http.js';
import type { ListNotificationsFilters, NotificationListResponse } from '../types/notification.js';

const makeAppError = (message: string, statusCode: number): AppError => {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getNotificationsForUser = async (filters: ListNotificationsFilters): Promise<NotificationListResponse> => {
    if (!Types.ObjectId.isValid(filters.userId)) {
        throw makeAppError('Invalid user id', 400);
    }

    const query: Record<string, unknown> = {
        userId: new Types.ObjectId(filters.userId)
    };

    if (filters.unreadOnly) {
        query.isRead = false;
    }

    const skip = (filters.page - 1) * filters.limit;

    const [notifications, total] = await Promise.all([
        Notification.find(query)
            .populate('ticketId', 'title')
            .sort({ isRead: 1, createdAt: -1 })
            .skip(skip)
            .limit(filters.limit)
            .exec(),
        Notification.countDocuments(query)
    ]);

    return {
        notifications,
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / filters.limit)
    };
};

const markNotificationRead = async (notificationId: string, userId: string): Promise<NotificationDocument | null> => {
    if (!Types.ObjectId.isValid(notificationId)) {
        throw makeAppError('Invalid notification id', 400);
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
        { isRead: true },
        { new: true }
    ).exec();

    return notification;
};

const markAllNotificationsRead = async (userId: string): Promise<void> => {
    if (!Types.ObjectId.isValid(userId)) {
        throw makeAppError('Invalid user id', 400);
    }

    await Notification.updateMany(
        { userId: new Types.ObjectId(userId), isRead: false },
        { isRead: true }
    ).exec();
};

export { getNotificationsForUser, markNotificationRead, markAllNotificationsRead };
