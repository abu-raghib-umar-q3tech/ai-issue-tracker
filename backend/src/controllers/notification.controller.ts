import type { Request, Response } from 'express';
import { getNotificationsForUser, markAllNotificationsRead, markNotificationRead } from '../services/notification.service.js';
import type { MessageResponse } from '../types/http.js';
import type { GetNotificationsQueryParams, NotificationListResponse, NotificationRouteParams } from '../types/notification.js';
import type { NotificationDocument } from '../models/notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getNotificationsHandler = asyncHandler(
    async (
        req: Request<{}, NotificationListResponse | MessageResponse, never, GetNotificationsQueryParams>,
        res: Response<NotificationListResponse | MessageResponse>
    ): Promise<void> => {
        const userId = req.user?.sub;

        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const page = parsePositiveInt(req.query.page, 1);
        const rawLimit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT);
        const limit = Math.min(rawLimit, MAX_LIMIT);
        const unreadOnly = req.query.unreadOnly === 'true';

        const result = await getNotificationsForUser({ userId, unreadOnly, page, limit });

        res.status(200).json(result);
    }
);

export { getNotificationsHandler };

const markNotificationReadHandler = asyncHandler(
    async (
        req: Request<NotificationRouteParams, NotificationDocument | MessageResponse, never>,
        res: Response<NotificationDocument | MessageResponse>
    ): Promise<void> => {
        const userId = req.user?.sub;

        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const notification = await markNotificationRead(req.params.id, userId);

        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }

        res.status(200).json(notification);
    }
);

const markAllNotificationsReadHandler = asyncHandler(
    async (
        req: Request<{}, MessageResponse, never>,
        res: Response<MessageResponse>
    ): Promise<void> => {
        const userId = req.user?.sub;

        if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        await markAllNotificationsRead(userId);
        res.status(200).json({ message: 'All notifications marked as read' });
    }
);

export { markAllNotificationsReadHandler, markNotificationReadHandler };
