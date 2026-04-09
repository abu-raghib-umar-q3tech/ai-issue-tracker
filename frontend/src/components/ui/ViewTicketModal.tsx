import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useGetActivityQuery } from '../../features/activity/activityApi';
import { useCreateCommentMutation, useGetCommentsQuery } from '../../features/comments/commentsApi';
import { TicketPriorityBadge } from '../../features/tickets/priorityUi';
import { TicketStatusBadge } from '../../features/tickets/statusUi';
import type { Ticket } from '../../features/tickets/types';

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (iso: string): string =>
    new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const timeAgo = (iso: string): string => {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    return formatDate(iso);
};

interface ViewTicketModalProps {
    ticket: Ticket;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => Promise<void>;
}

type ActiveTab = 'details' | 'comments' | 'activity';

const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'comments', label: 'Comments' },
    { id: 'activity', label: 'Activity' },
];

const ViewTicketModal = ({ ticket, onClose, onEdit, onDelete }: ViewTicketModalProps) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('details');
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [commentText, setCommentText] = useState('');

    const { data: comments = [], isLoading: isLoadingComments, isError: isCommentsError } = useGetCommentsQuery(ticket._id);
    const { data: activities = [], isLoading: isLoadingActivities, isError: isActivitiesError } = useGetActivityQuery(ticket._id);
    const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();

    const handlePostComment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const text = commentText.trim();
        if (!text || isPosting) return;
        await createComment({ text, ticketId: ticket._id });
        setCommentText('');
    };

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const text = commentText.trim();
            if (!text || isPosting) return;
            void createComment({ text, ticketId: ticket._id });
            setCommentText('');
        }
    };

    useEffect(() => {
        if (activeTab === 'comments' && comments.length > 0) {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments.length, activeTab]);

    // Reset state whenever a new ticket is viewed
    useEffect(() => {
        setActiveTab('details');
        setIsDescExpanded(false);
        setIsConfirmingDelete(false);
    }, [ticket._id]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current && !isDeleting) onClose();
    };

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="view-modal-title"
                className="flex w-full max-w-xl max-h-[90vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex flex-none items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div className="min-w-0">
                        <h2
                            id="view-modal-title"
                            className="text-base font-semibold leading-snug text-slate-900"
                        >
                            {ticket.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <TicketStatusBadge status={ticket.status} />
                            <TicketPriorityBadge priority={ticket.priority} />
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Close"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        onClick={onClose}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                {/* Tab bar */}
                <div className="flex flex-none border-b border-slate-100 px-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative mr-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-slate-800'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">

                    {/* ── Details Tab ── */}
                    {activeTab === 'details' && (
                        <div className="space-y-5">
                            {/* Description */}
                            <div>
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Description
                                </p>
                                {ticket.description ? (
                                    <>
                                        <div
                                            className={`break-words text-sm leading-relaxed text-slate-700 whitespace-pre-wrap transition-all duration-200 ${isDescExpanded
                                                ? 'max-h-48 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/60 p-3'
                                                : 'line-clamp-3'
                                                }`}
                                        >
                                            {ticket.description}
                                        </div>
                                        <button
                                            type="button"
                                            className="mt-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                                            onClick={() => setIsDescExpanded((prev) => !prev)}
                                        >
                                            {isDescExpanded ? 'See less' : 'See more'}
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-400">No description provided.</p>
                                )}
                            </div>

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Estimated Time
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">{ticket.estimatedTime || '—'}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Created
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">{formatDate(ticket.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Created By
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">{ticket.createdBy?.name ?? 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Assigned To
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {ticket.assignedTo?.name ?? <span className="text-slate-400">Unassigned</span>}
                                    </p>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Tags
                                </p>
                                {ticket.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {ticket.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100/70 px-2.5 py-0.5 text-[11px] font-medium text-gray-500"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">No tags</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Comments Tab ── */}
                    {activeTab === 'comments' && (
                        <div className="space-y-4">
                            {/* Comment list */}
                            <div className="space-y-3">
                                {isLoadingComments ? (
                                    <div className="flex items-center gap-2 py-4 text-slate-400">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" aria-hidden="true" />
                                        <span className="text-sm">Loading comments…</span>
                                    </div>
                                ) : isCommentsError ? (
                                    <p className="text-sm text-red-500">Failed to load comments.</p>
                                ) : comments.length === 0 ? (
                                    <p className="text-sm text-slate-400">No comments yet.</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment._id} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-semibold text-slate-700">{comment.userId.name}</span>
                                                <span className="text-[10px] text-slate-400">{formatTime(comment.createdAt)}</span>
                                            </div>
                                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{comment.text}</p>
                                        </div>
                                    ))
                                )}
                                <div ref={commentsEndRef} />
                            </div>

                            {/* Post comment form */}
                            <form onSubmit={handlePostComment} className="space-y-2 pt-1">
                                <textarea
                                    rows={3}
                                    placeholder="Add a comment… (Enter to submit, Shift+Enter for new line)"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={handleTextareaKeyDown}
                                    disabled={isPosting}
                                    className="app-textarea"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isPosting || !commentText.trim()}
                                        className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-50"
                                    >
                                        {isPosting ? (
                                            <>
                                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                                                Posting…
                                            </>
                                        ) : 'Post Comment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── Activity Tab ── */}
                    {activeTab === 'activity' && (
                        <div>
                            {isLoadingActivities ? (
                                <div className="flex items-center gap-2 py-4 text-slate-400">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" aria-hidden="true" />
                                    <span className="text-sm">Loading activity…</span>
                                </div>
                            ) : isActivitiesError ? (
                                <p className="text-sm text-red-500">Failed to load activity.</p>
                            ) : activities.length === 0 ? (
                                <p className="text-sm text-slate-400">No activity yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {activities.map((activity) => (
                                        <li key={activity._id} className="flex items-start gap-2.5">
                                            <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-slate-300" aria-hidden="true" />
                                            <div className="min-w-0">
                                                <span className="text-xs font-semibold text-slate-700">{activity.userId.name}</span>
                                                <span className="text-xs text-slate-500">{' '}{activity.action}</span>
                                                <p className="mt-0.5 text-[10px] text-slate-400">{timeAgo(activity.createdAt)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-none items-center justify-between gap-2 border-t border-slate-100 px-6 py-4">
                    {/* Left: delete / confirm */}
                    {isConfirmingDelete ? (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
                            <span className="text-xs font-medium text-red-700">Delete this ticket?</span>
                            <button
                                type="button"
                                disabled={isDeleting}
                                className="rounded px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                                onClick={async () => {
                                    setIsDeleting(true);
                                    await onDelete();
                                    setIsDeleting(false);
                                }}
                            >
                                {isDeleting ? 'Deleting…' : 'Yes, delete'}
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                className="rounded px-2 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                                onClick={() => setIsConfirmingDelete(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            onClick={() => setIsConfirmingDelete(true)}
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete
                        </button>
                    )}

                    {/* Right: close + edit */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="btn-secondary px-4 py-2 text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm"
                            onClick={() => {
                                onClose();
                                onEdit();
                            }}
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export { ViewTicketModal };
