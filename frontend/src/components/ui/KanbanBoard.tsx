import { useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { TicketPriorityBadge } from '../../features/tickets/priorityUi';
import type { Ticket, TicketStatus } from '../../features/tickets/types';
import { ViewTicketModal } from './ViewTicketModal';
import { useAuth } from '../../features/auth/AuthProvider';

const NO_PERMISSION_TOOLTIP = "You don't have permission to change this ticket";

const COLUMNS: Array<{ status: TicketStatus; dotClass: string; dropBg: string }> = [
    {
        status: 'Todo',
        dotClass: 'h-2 w-2 rounded-full bg-slate-400',
        dropBg: 'bg-slate-50/80'
    },
    {
        status: 'In Progress',
        dotClass: 'h-2 w-2 rounded-full bg-sky-400 animate-pulse',
        dropBg: 'bg-sky-50/50'
    },
    {
        status: 'Done',
        dotClass: 'h-2 w-2 rounded-full bg-emerald-400',
        dropBg: 'bg-emerald-50/50'
    }
];

interface KanbanBoardProps {
    tickets: Ticket[];
    updatingId: string | null;
    onStatusChange: (ticketId: string, status: TicketStatus) => Promise<void>;
    onEdit: (ticket: Ticket) => void;
    onDelete: (ticketId: string) => Promise<void>;
}

const KanbanBoard = ({ tickets, updatingId, onStatusChange, onEdit, onDelete }: KanbanBoardProps) => {
    const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
    const { user, isAdmin } = useAuth();

    const canEditTicket = (ticket: Ticket): boolean => {
        if (!user) return false;
        if (isAdmin) return true;
        return ticket.createdBy._id === user.id || ticket.assignedTo?._id === user.id;
    };

    const grouped: Record<TicketStatus, Ticket[]> = {
        Todo: tickets.filter((t) => t.status === 'Todo'),
        'In Progress': tickets.filter((t) => t.status === 'In Progress'),
        Done: tickets.filter((t) => t.status === 'Done')
    };

    const handleDragEnd = (result: DropResult): void => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as TicketStatus;
        void onStatusChange(draggableId, newStatus);
    };

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid gap-4 sm:grid-cols-3">
                    {COLUMNS.map((col) => (
                        <div
                            key={col.status}
                            className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                            {/* Column header */}
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className={col.dotClass} aria-hidden="true" />
                                    <h2 className="text-sm font-semibold text-slate-700">{col.status}</h2>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
                                    {grouped[col.status].length}
                                </span>
                            </div>

                            {/* Droppable area */}
                            <Droppable droppableId={col.status}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 space-y-3 overflow-y-auto p-3 transition-colors duration-200 ${snapshot.isDraggingOver ? col.dropBg : 'bg-white'
                                            }`}
                                        style={{ minHeight: '12rem', maxHeight: '62vh' }}
                                    >
                                        {grouped[col.status].map((ticket, index) => (
                                            <Draggable key={ticket._id} draggableId={ticket._id} index={index} isDragDisabled={!canEditTicket(ticket)}>
                                                {(dragProvided, dragSnapshot) => (
                                                    <div
                                                        ref={dragProvided.innerRef}
                                                        {...dragProvided.draggableProps}
                                                        {...dragProvided.dragHandleProps}
                                                        className={`rounded-xl border bg-white p-3 transition-shadow duration-200 ${dragSnapshot.isDragging
                                                            ? 'border-slate-300 shadow-lg ring-2 ring-slate-200/80'
                                                            : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
                                                            } ${updatingId === ticket._id ? 'opacity-50' : ''} ${!canEditTicket(ticket) ? 'cursor-default' : 'cursor-pointer'}`}
                                                        onClick={() => {
                                                            if (!dragSnapshot.isDragging) setViewingTicket(ticket);
                                                        }}
                                                    >
                                                        {/* Title */}
                                                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                                                            {ticket.title}
                                                        </p>

                                                        {/* Priority + ETA */}
                                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                            <TicketPriorityBadge priority={ticket.priority} />
                                                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
                                                                {ticket.estimatedTime}
                                                            </span>
                                                        </div>

                                                        {/* Description */}
                                                        {ticket.description ? (
                                                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                                                                {ticket.description}
                                                            </p>
                                                        ) : null}

                                                        {/* Tags */}
                                                        {ticket.tags.length > 0 ? (
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {ticket.tags.slice(0, 3).map((tag) => (
                                                                    <span
                                                                        key={tag}
                                                                        className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100/70 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                                {ticket.tags.length > 3 ? (
                                                                    <span className="text-[10px] text-slate-400">+{ticket.tags.length - 3}</span>
                                                                ) : null}
                                                            </div>
                                                        ) : null}

                                                        {/* Created by / Assigned to */}
                                                        <div className="mt-2.5 space-y-0.5">
                                                            <p className="text-[10px] text-slate-400">
                                                                <span className="font-medium text-slate-500">Created by:</span>{' '}
                                                                {ticket.createdBy.name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">
                                                                <span className="font-medium text-slate-500">Assigned to:</span>{' '}
                                                                {ticket.assignedTo?.name ?? 'Unassigned'}
                                                            </p>
                                                        </div>

                                                        {/* Footer: View + Edit buttons */}
                                                        <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2.5">
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewingTicket(ticket);
                                                                }}
                                                            >
                                                                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                                                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                </svg>
                                                                View
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={!canEditTicket(ticket)}
                                                                title={!canEditTicket(ticket) ? NO_PERMISSION_TOOLTIP : undefined}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEdit(ticket);
                                                                }}
                                                            >
                                                                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}

                                        {provided.placeholder}

                                        {grouped[col.status].length === 0 && !snapshot.isDraggingOver ? (
                                            <div className="flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-200">
                                                <p className="text-xs text-slate-400">No tickets</p>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {viewingTicket ? (
                <ViewTicketModal
                    ticket={viewingTicket}
                    onClose={() => setViewingTicket(null)}
                    onEdit={() => {
                        onEdit(viewingTicket);
                        setViewingTicket(null);
                    }}
                    onDelete={async () => {
                        await onDelete(viewingTicket._id);
                        setViewingTicket(null);
                    }}
                />
            ) : null}
        </>
    );
};

export { KanbanBoard };
