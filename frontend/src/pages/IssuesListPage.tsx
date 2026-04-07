import { useMemo, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { EditTicketModal } from '../components/ui/EditTicketModal';
import { ViewTicketModal } from '../components/ui/ViewTicketModal';
import { EmptyState } from '../components/ui/EmptyState';
import { ApiErrorAlert } from '../components/ui/ApiErrorAlert';
import { TicketListSkeleton } from '../components/ui/Skeleton';
import { TicketPriorityBadge } from '../features/tickets/priorityUi';
import { TicketStatusBadge, getTicketStatusSelectClassName } from '../features/tickets/statusUi';
import { useDeleteTicketMutation, useGetTicketsQuery, useUpdateTicketMutation } from '../features/tickets/ticketsApi';
import type { Ticket, TicketPriority, TicketStatus, UpdateTicketRequest } from '../features/tickets/types';
import { KanbanBoard } from '../components/ui/KanbanBoard';
import { useDebounce } from '../hooks/useDebounce';
import { useInitialLoadSkeleton } from '../hooks/useInitialLoadSkeleton';

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

type StatusFilter = 'all' | TicketStatus;
type PriorityFilter = 'all' | TicketPriority;

const statusOptions: Array<StatusFilter> = ['all', 'Todo', 'In Progress', 'Done'];
const priorityOptions: Array<PriorityFilter> = ['all', 'Low', 'Medium', 'High'];

const IssuesListPage = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const debouncedSearch = useDebounce(search, 300);

  const queryArgs = useMemo(
    () =>
      viewMode === 'kanban'
        ? {
          limit: 1000,
          search: debouncedSearch.trim() || undefined,
          priority: priorityFilter === 'all' ? undefined : priorityFilter
        }
        : {
          page,
          limit,
          status: statusFilter === 'all' ? undefined : statusFilter,
          priority: priorityFilter === 'all' ? undefined : priorityFilter,
          search: debouncedSearch.trim() || undefined
        },
    [debouncedSearch, limit, page, priorityFilter, statusFilter, viewMode]
  );

  const { data, isLoading, isError, error, isFetching } = useGetTicketsQuery(queryArgs);
  const [updateTicket, { isError: isUpdateError, error: updateError }] = useUpdateTicketMutation();
  const [deleteTicket, { isError: isDeleteError, error: deleteError }] = useDeleteTicketMutation();
  const showInitialSkeleton = useInitialLoadSkeleton(isLoading && !isError, Boolean(data) || isError);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as StatusFilter);
    setPage(1);
  };

  const handlePriorityFilter = (event: ChangeEvent<HTMLSelectElement>) => {
    setPriorityFilter(event.target.value as PriorityFilter);
    setPage(1);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  const handleSaveEdit = async (data: UpdateTicketRequest): Promise<void> => {
    if (!editingTicket) return;
    await updateTicket({ id: editingTicket._id, data }).unwrap();
    setEditingTicket(null);
  };

  const handleDeleteConfirm = async (ticketId: string) => {
    await deleteTicket(ticketId).unwrap();
    setConfirmDeleteId(null);
  };

  const handleStatusUpdate = async (ticketId: string, status: TicketStatus) => {
    setUpdatingId(ticketId);

    try {
      await updateTicket({
        id: ticketId,
        data: { status }
      }).unwrap();
    } catch (_requestError: unknown) {
      // API error is already exposed via RTK Query state.
    } finally {
      setUpdatingId(null);
    }
  };

  const tickets = data?.tickets ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasActiveFilters = Boolean(debouncedSearch || statusFilter !== 'all' || priorityFilter !== 'all');

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setPage(1);
  };

  return (
    <section className="page-stack">
      <header className="hero-strip">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace Queue</p>
            <h1 className="app-heading">Issues List</h1>
            <p className="app-subheading">Track, filter, and update ticket status with smooth workflow controls.</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/60 p-1">
            <button
              type="button"
              aria-label="List view"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              onClick={() => setViewMode('list')}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" />
              </svg>
              List
            </button>
            <button
              type="button"
              aria-label="Kanban view"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              onClick={() => setViewMode('kanban')}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2 3a1 1 0 00-1 1v2a1 1 0 001 1h5a1 1 0 001-1V4a1 1 0 00-1-1H2zM2 9a1 1 0 00-1 1v6a1 1 0 001 1h5a1 1 0 001-1v-6a1 1 0 00-1-1H2zM9 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V4zM10 13a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1v-2a1 1 0 00-1-1h-6z" />
              </svg>
              Kanban
            </button>
          </div>
        </div>
      </header>

      <section className={`app-panel grid gap-5 ${viewMode === 'kanban' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        <div className={viewMode === 'kanban' ? 'md:col-span-2' : 'md:col-span-3'}>
          <label className="app-label" htmlFor="ticket-search">Search</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400" aria-hidden="true">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              id="ticket-search"
              type="search"
              className="app-input pl-10"
              placeholder="Search by title or description…"
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>

        {viewMode === 'list' ? (
          <div>
            <label className="app-label">Status</label>
            <select className={getTicketStatusSelectClassName(statusFilter)} value={statusFilter} onChange={handleStatusFilter}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className="app-label">Priority</label>
          <select className="app-select" value={priorityFilter} onChange={handlePriorityFilter}>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority === 'all' ? 'All Priorities' : priority}
              </option>
            ))}
          </select>
        </div>

        {viewMode === 'list' ? (
          <div>
            <label className="app-label">Limit</label>
            <select className="app-select" value={limit} onChange={handleLimitChange}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        ) : null}
      </section>

      {isError ? <ApiErrorAlert error={error} fallbackMessage="Failed to load tickets." /> : null}
      {isUpdateError ? <ApiErrorAlert error={updateError} fallbackMessage="Failed to update ticket." /> : null}
      {isDeleteError ? <ApiErrorAlert error={deleteError} fallbackMessage="Failed to delete ticket." /> : null}

      {showInitialSkeleton ? (
        <TicketListSkeleton count={4} />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tickets={tickets}
          updatingId={updatingId}
          onStatusChange={handleStatusUpdate}
          onEdit={(ticket) => setEditingTicket(ticket)}
          onDelete={async (ticketId) => {
            await deleteTicket(ticketId).unwrap();
          }}
        />
      ) : (
        <>
          <div className={`content-appear space-y-4 transition-opacity duration-200 ${isFetching ? 'pointer-events-none opacity-50' : 'opacity-100'}`}>
            {tickets.map((ticket) => (
              <article key={ticket._id} className="app-panel-hover overflow-hidden">
                {/* Card body — entire area is clickable */}
                <div
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer space-y-2.5 p-5 hover:bg-slate-50/50 transition-colors duration-150"
                  onClick={() => setViewingTicket(ticket)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setViewingTicket(ticket); }}
                >
                  {/* Row 1: title + status badge + date */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                      <h2 className="app-card-title">{ticket.title}</h2>
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                    <span className="app-meta-text shrink-0 text-slate-400">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>

                  {/* Row 2: priority + tags (max 3) */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <TicketPriorityBadge priority={ticket.priority} />
                    {ticket.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100/70 px-2.5 py-0.5 text-[11px] font-medium text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                    {ticket.tags.length > 3 ? (
                      <span className="text-[11px] font-medium text-slate-400">+{ticket.tags.length - 3} more</span>
                    ) : null}
                  </div>

                  {/* Row 3: description — 2 line clamp */}
                  <p className="line-clamp-2 break-words text-sm leading-relaxed text-slate-500">
                    {ticket.description}
                  </p>
                </div>

                {/* Card footer */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Status select */}
                  <div className="flex items-center gap-2">
                    <label className="app-meta-text shrink-0 text-slate-500">Status:</label>
                    <select
                      className={`${getTicketStatusSelectClassName(ticket.status)} py-1 text-xs`}
                      value={ticket.status}
                      disabled={updatingId === ticket._id}
                      onChange={(e) => handleStatusUpdate(ticket._id, e.target.value as TicketStatus)}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    {updatingId === ticket._id ? (
                      <span className="app-meta-text text-slate-400">Updating…</span>
                    ) : null}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {confirmDeleteId === ticket._id ? (
                      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
                        <span className="text-xs font-medium text-red-700">Delete this ticket?</span>
                        <button
                          type="button"
                          className="rounded px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          onClick={() => handleDeleteConfirm(ticket._id)}
                        >
                          Yes, delete
                        </button>
                        <button
                          type="button"
                          className="rounded px-2 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                          onClick={() => setEditingTicket(ticket)}
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit Ticket
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          onClick={() => setConfirmDeleteId(ticket._id)}
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {!isLoading && !isError && tickets.length === 0 ? (
              hasActiveFilters ? (
                <EmptyState
                  title="No results found"
                  description="No tickets match your current filters."
                  action={
                    <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={handleClearFilters}>
                      Clear filters
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  title="No tickets yet"
                  description="Create your first issue to get started."
                  action={
                    <Link to="/create-issue" className="btn-primary">
                      Create Issue
                    </Link>
                  }
                />
              )
            ) : null}
          </div>

          <footer className="app-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <p className="app-meta-text text-slate-600">
                Page {data?.page ?? page} of {totalPages || 1}
              </p>
              {isFetching ? (
                <svg className="h-3.5 w-3.5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none" aria-label="Refreshing">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                disabled={isFetching || (totalPages > 0 && page >= totalPages)}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </footer>
        </>
      )}
      {viewingTicket ? (
        <ViewTicketModal
          ticket={viewingTicket}
          onClose={() => setViewingTicket(null)}
          onEdit={() => {
            setEditingTicket(viewingTicket);
            setViewingTicket(null);
          }}
          onDelete={async () => {
            await handleDeleteConfirm(viewingTicket._id);
            setViewingTicket(null);
          }}
        />
      ) : null}
      {editingTicket ? (
        <EditTicketModal
          ticket={editingTicket}
          onClose={() => setEditingTicket(null)}
          onSave={handleSaveEdit}
        />
      ) : null}
    </section>
  );
};

export { IssuesListPage };
