import { useMemo, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { ApiErrorAlert } from '../components/ui/ApiErrorAlert';
import { TicketListSkeleton } from '../components/ui/Skeleton';
import { TicketPriorityBadge } from '../features/tickets/priorityUi';
import { TicketStatusBadge, getTicketStatusSelectClassName } from '../features/tickets/statusUi';
import { useGetTicketsQuery, useUpdateTicketMutation } from '../features/tickets/ticketsApi';
import type { TicketPriority, TicketStatus } from '../features/tickets/types';
import { useInitialLoadSkeleton } from '../hooks/useInitialLoadSkeleton';

type StatusFilter = 'all' | TicketStatus;
type PriorityFilter = 'all' | TicketPriority;

const statusOptions: Array<StatusFilter> = ['all', 'Todo', 'In Progress', 'Done'];
const priorityOptions: Array<PriorityFilter> = ['all', 'Low', 'Medium', 'High'];

const IssuesListPage = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const queryArgs = useMemo(
    () => ({
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter
    }),
    [limit, page, priorityFilter, statusFilter]
  );

  const { data, isLoading, isError, error, isFetching } = useGetTicketsQuery(queryArgs);
  const [updateTicket, { isError: isUpdateError, error: updateError }] = useUpdateTicketMutation();
  const showInitialSkeleton = useInitialLoadSkeleton(isLoading && !isError, Boolean(data) || isError);

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

  return (
    <section className="page-stack">
      <header className="hero-strip space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace Queue</p>
        <h1 className="app-heading">Issues List</h1>
        <p className="app-subheading">Track, filter, and update ticket status with smooth workflow controls.</p>
      </header>

      <section className="app-panel grid gap-5 md:grid-cols-3">
        <div>
          <label className="app-label">Status</label>
          <select className={getTicketStatusSelectClassName(statusFilter)} value={statusFilter} onChange={handleStatusFilter}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="app-label">Priority</label>
          <select className="app-select" value={priorityFilter} onChange={handlePriorityFilter}>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="app-label">Limit</label>
          <select className="app-select" value={limit} onChange={handleLimitChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </section>

      {isError ? <ApiErrorAlert error={error} fallbackMessage="Failed to load tickets." /> : null}
      {isUpdateError ? <ApiErrorAlert error={updateError} fallbackMessage="Failed to update ticket." /> : null}

      {showInitialSkeleton ? (
        <TicketListSkeleton count={4} />
      ) : (
        <>
          <div className="space-y-5">
            {tickets.map((ticket) => (
              <article key={ticket._id} className="app-panel-hover">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="app-card-title md:text-[1.45rem]">{ticket.title}</h2>
                      <TicketStatusBadge status={ticket.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <TicketPriorityBadge priority={ticket.priority} showLabel />
                      <span className="badge-chip border-slate-200 bg-slate-50 text-sm font-medium normal-case tracking-normal text-gray-500">ETA: {ticket.estimatedTime}</span>
                    </div>

                    <p className="app-description text-gray-600">{ticket.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.length ? (
                        ticket.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-100/70 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="app-meta-text text-gray-500">No tags</span>
                      )}
                    </div>
                  </div>

                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 lg:w-56">
                    <label className="app-label">Status</label>
                    <select
                      className={getTicketStatusSelectClassName(ticket.status)}
                      value={ticket.status}
                      disabled={updatingId === ticket._id}
                      onChange={(event) => handleStatusUpdate(ticket._id, event.target.value as TicketStatus)}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    {updatingId === ticket._id ? <p className="app-meta-text mt-2">Updating status...</p> : null}
                  </div>
                </div>
              </article>
            ))}

            {!isLoading && !isError && tickets.length === 0 ? (
              <EmptyState
                title="No tickets found"
                description="Create your first issue"
                action={
                  <Link to="/create-issue" className="btn-primary">
                    Create Issue
                  </Link>
                }
              />
            ) : null}
          </div>

          <footer className="app-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="app-meta-text text-slate-600">
              Page {data?.page ?? page} of {totalPages || 1}
              {isFetching ? ' (Refreshing...)' : ''}
            </p>
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
    </section>
  );
};

export { IssuesListPage };
