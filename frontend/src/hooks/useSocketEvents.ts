import { useEffect } from 'react';
import { useAppDispatch } from '../app/hooks';
import { socket } from '../services/socket';
import { baseApi } from '../services/baseApi';
import { showInfoToast } from '../components/ui/toast';

interface NotificationPayload {
    _id: string;
    message: string;
    ticketId: string;
    isRead: boolean;
    createdAt: string;
}

const useSocketEvents = (): void => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const onTicketCreated = (_payload: { ticketId: string }) => {
            dispatch(baseApi.util.invalidateTags([{ type: 'Tickets', id: 'LIST' }]));
        };

        const onTicketUpdated = ({ ticketId }: { ticketId: string }) => {
            dispatch(
                baseApi.util.invalidateTags([
                    { type: 'Tickets', id: ticketId },
                    { type: 'Tickets', id: 'LIST' },
                    { type: 'Activity', id: ticketId },
                ])
            );
        };

        const onCommentAdded = ({ ticketId }: { ticketId: string }) => {
            dispatch(
                baseApi.util.invalidateTags([
                    { type: 'Comments', id: ticketId },
                    { type: 'Activity', id: ticketId },
                ])
            );
        };

        const onNotification = (payload: NotificationPayload) => {
            showInfoToast(payload.message);
            dispatch(baseApi.util.invalidateTags([{ type: 'Notifications', id: 'LIST' }]));
        };

        socket.on('ticketCreated', onTicketCreated);
        socket.on('ticketUpdated', onTicketUpdated);
        socket.on('commentAdded', onCommentAdded);
        socket.on('notification', onNotification);

        return () => {
            socket.off('ticketCreated', onTicketCreated);
            socket.off('ticketUpdated', onTicketUpdated);
            socket.off('commentAdded', onCommentAdded);
            socket.off('notification', onNotification);
        };
    }, [dispatch]);
};

export { useSocketEvents };
