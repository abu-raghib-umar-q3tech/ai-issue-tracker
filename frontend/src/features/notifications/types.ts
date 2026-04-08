export interface NotificationTicket {
    _id: string;
    title: string;
}

export interface Notification {
    _id: string;
    userId: string;
    message: string;
    ticketId: NotificationTicket;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationListResponse {
    notifications: Notification[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface GetNotificationsParams {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
}
