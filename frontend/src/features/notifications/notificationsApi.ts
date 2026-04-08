import { showErrorToast } from '../../components/ui/toast';
import { getRtkQueryErrorMessage } from '../../types/api';
import { baseApi } from '../../services/baseApi';
import type { GetNotificationsParams, Notification, NotificationListResponse } from './types';

const buildNotificationsQuery = (params?: GetNotificationsParams): string => {
    if (!params) return '/notifications';

    const searchParams = new URLSearchParams();

    if (params.unreadOnly) searchParams.set('unreadOnly', 'true');
    if (typeof params.page === 'number') searchParams.set('page', String(params.page));
    if (typeof params.limit === 'number') searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    return qs ? `/notifications?${qs}` : '/notifications';
};

const notificationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<NotificationListResponse, GetNotificationsParams | void>({
            query: (params) => buildNotificationsQuery(params ?? undefined),
            providesTags: [{ type: 'Notifications', id: 'LIST' }]
        }),

        markAsRead: builder.mutation<Notification, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: 'PUT'
            }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
            async onQueryStarted(_id, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error: unknown) {
                    showErrorToast(getRtkQueryErrorMessage(error, 'Failed to mark notification as read.'));
                }
            }
        }),

        markAllAsRead: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PUT'
            }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error: unknown) {
                    showErrorToast(getRtkQueryErrorMessage(error, 'Failed to mark all notifications as read.'));
                }
            }
        })
    })
});

export const { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } = notificationsApi;
export { notificationsApi };
