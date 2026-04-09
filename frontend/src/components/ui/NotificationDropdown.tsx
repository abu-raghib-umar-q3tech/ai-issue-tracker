import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useGetNotificationsQuery,
    useMarkAllAsReadMutation,
    useMarkAsReadMutation
} from '../../features/notifications/notificationsApi';

const timeAgo = (iso: string): string => {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { data, isLoading } = useGetNotificationsQuery({ limit: 20 });
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

    const notifications = data?.notifications ?? [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    const handleNotificationClick = async (id: string, ticketId: string, isRead: boolean) => {
        setIsOpen(false);
        if (!isRead) {
            void markAsRead(id);
        }
        navigate('/issues', { state: { openTicketId: ticketId } });
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Bell button */}
            <button
                type="button"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                onClick={() => setIsOpen((v) => !v)}
                className="btn-ghost relative text-slate-500 hover:text-slate-700"
            >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 13h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                {unreadCount > 0 ? (
                    <span
                        aria-hidden="true"
                        className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white"
                    >
                        {badgeLabel}
                    </span>
                ) : null}
            </button>

            {/* Dropdown panel */}
            {isOpen ? (
                <div
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute right-0 top-full z-40 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">Notifications</p>
                        {unreadCount > 0 ? (
                            <button
                                type="button"
                                disabled={isMarkingAll}
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-800 disabled:opacity-50"
                            >
                                {isMarkingAll ? 'Marking…' : 'Mark all as read'}
                            </button>
                        ) : null}
                    </div>

                    {/* Body */}
                    <ul className="max-h-[22rem] overflow-y-auto divide-y divide-slate-100">
                        {isLoading ? (
                            <li className="flex items-center gap-2 px-4 py-6 text-sm text-slate-400">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" aria-hidden="true" />
                                Loading…
                            </li>
                        ) : notifications.length === 0 ? (
                            <li className="px-4 py-8 text-center text-sm text-slate-400">
                                No notifications yet.
                            </li>
                        ) : (
                            notifications.map((notification) => (
                                <li key={notification._id}>
                                    <button
                                        type="button"
                                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${!notification.isRead ? 'bg-sky-50/60' : ''}`}
                                        onClick={() => handleNotificationClick(
                                            notification._id,
                                            notification.ticketId?._id ?? '',
                                            notification.isRead
                                        )}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            {/* Unread dot */}
                                            <span
                                                className={`mt-1.5 h-2 w-2 flex-none rounded-full transition-colors ${!notification.isRead ? 'bg-sky-500' : 'bg-transparent'}`}
                                                aria-hidden="true"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-sm leading-snug ${!notification.isRead ? 'font-semibold text-slate-900' : 'font-normal text-slate-600'}`}>
                                                    {notification.message}
                                                </p>
                                                {notification.ticketId?.title ? (
                                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                                        {notification.ticketId.title}
                                                    </p>
                                                ) : null}
                                                <p className="mt-1 text-[10px] text-slate-400">
                                                    {timeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            ) : null}
        </div>
    );
};

export { NotificationDropdown };
