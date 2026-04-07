import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TicketPriorityBadge } from '../../features/tickets/priorityUi';
import { TicketStatusBadge } from '../../features/tickets/statusUi';
import type { Ticket } from '../../features/tickets/types';

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

interface ViewTicketModalProps {
    ticket: Ticket;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => Promise<void>;
}

const ViewTicketModal = ({ ticket, onClose, onEdit, onDelete }: ViewTicketModalProps) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset state whenever a new ticket is viewed
    useEffect(() => {
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
                    <h2
                        id="view-modal-title"
                        className="text-base font-semibold leading-snug text-slate-900"
                    >
                        {ticket.title}
                    </h2>
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

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Status + Priority row */}
                    <div className="flex flex-wrap items-center gap-2">
                        <TicketStatusBadge status={ticket.status} />
                        <TicketPriorityBadge priority={ticket.priority} />
                    </div>

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

                    {/* Meta row: ETA + Created */}
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
