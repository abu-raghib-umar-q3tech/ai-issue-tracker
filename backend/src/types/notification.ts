import type { NotificationDocument } from '../models/notification.model.js';

interface GetNotificationsQueryParams {
    unreadOnly?: string;
    page?: string;
    limit?: string;
}

interface ListNotificationsFilters {
    userId: string;
    unreadOnly: boolean;
    page: number;
    limit: number;
}

interface NotificationListResponse {
    notifications: NotificationDocument[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface NotificationRouteParams {
    id: string;
}

export type { GetNotificationsQueryParams, ListNotificationsFilters, NotificationListResponse, NotificationRouteParams };
