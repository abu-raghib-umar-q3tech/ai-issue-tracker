import { type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ApiErrorAlert } from '../components/ui/ApiErrorAlert';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { useGetTicketsQuery } from '../features/tickets/ticketsApi';
import type { TicketPriority } from '../features/tickets/types';
import { useInitialLoadSkeleton } from '../hooks/useInitialLoadSkeleton';

interface PriorityChartDatum {
  priority: TicketPriority;
  count: number;
  fill: string;
}

interface StatusChartDatum {
  name: 'Done' | 'In Progress' | 'Todo';
  value: number;
  fill: string;
}

interface MetricCardProps {
  label: string;
  value: number;
  accentClass: string;
  valueClass: string;
  iconBgClass: string;
  icon: ReactNode;
}

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  Low: '#16a34a',
  Medium: '#d97706',
  High: '#dc2626'
};

const STATUS_COLORS: Record<StatusChartDatum['name'], string> = {
  Done: '#16a34a',
  'In Progress': '#2563eb',
  Todo: '#64748b'
};

const MetricCard = ({ label, value, accentClass, valueClass, iconBgClass, icon }: MetricCardProps) => {
  return (
    <article className="app-panel-hover transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <div className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg ${iconBgClass}`}>
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${valueClass}`}>{value}</p>
      <div className={`mt-4 h-0.5 w-full rounded-full opacity-40 ${accentClass}`} aria-hidden="true" />
    </article>
  );
};

const DashboardPage = () => {
  const { data, isLoading, isError, error } = useGetTicketsQuery({ page: 1, limit: 1000 });
  const showInitialSkeleton = useInitialLoadSkeleton(isLoading && !isError, Boolean(data) || isError);

  const tickets = data?.tickets ?? [];
  const totalTickets = data?.total ?? 0;
  const completedTickets = tickets.filter((t) => t.status === 'Done').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'In Progress').length;
  const todoTickets = tickets.filter((t) => t.status === 'Todo').length;
  const pendingTickets = inProgressTickets + todoTickets;

  const statusChartData: StatusChartDatum[] = [
    { name: 'Done', value: completedTickets, fill: STATUS_COLORS.Done },
    { name: 'In Progress', value: inProgressTickets, fill: STATUS_COLORS['In Progress'] },
    { name: 'Todo', value: todoTickets, fill: STATUS_COLORS.Todo }
  ];

  const priorityChartData: PriorityChartDatum[] = [
    {
      priority: 'Low',
      count: tickets.filter((t) => t.priority === 'Low').length,
      fill: PRIORITY_COLORS.Low
    },
    {
      priority: 'Medium',
      count: tickets.filter((t) => t.priority === 'Medium').length,
      fill: PRIORITY_COLORS.Medium
    },
    {
      priority: 'High',
      count: tickets.filter((t) => t.priority === 'High').length,
      fill: PRIORITY_COLORS.High
    }
  ];

  const hasStatusData = statusChartData.some((datum) => datum.value > 0);
  const hasPriorityData = priorityChartData.some((datum) => datum.count > 0);

  return (
    <section className="page-stack">
      <header className="hero-strip space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admin Overview</p>
        <h1 className="app-heading">Dashboard</h1>
        <p className="app-subheading">Monitor ticket flow, completion progress, and priority workload at a glance.</p>
      </header>

      {isError ? <ApiErrorAlert error={error} fallbackMessage="Failed to load dashboard metrics." /> : null}

      {showInitialSkeleton ? <DashboardSkeleton /> : null}

      {!showInitialSkeleton && !isLoading && !isError ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total"
              value={totalTickets}
              accentClass="bg-slate-700"
              valueClass="text-slate-900"
              iconBgClass="bg-slate-100"
              icon={
                <svg className="h-4 w-4 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              }
            />
            <MetricCard
              label="Completed"
              value={completedTickets}
              accentClass="bg-emerald-500"
              valueClass="text-emerald-700"
              iconBgClass="bg-emerald-100"
              icon={
                <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              }
            />
            <MetricCard
              label="In Progress"
              value={inProgressTickets}
              accentClass="bg-sky-500"
              valueClass="text-sky-700"
              iconBgClass="bg-sky-100"
              icon={
                <svg className="h-4 w-4 text-sky-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              }
            />
            <MetricCard
              label="Open"
              value={pendingTickets}
              accentClass="bg-amber-500"
              valueClass="text-amber-700"
              iconBgClass="bg-amber-100"
              icon={
                <svg className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              }
            />
          </div>

          <div className="grid gap-7 xl:grid-cols-5">
            <section className="app-panel xl:col-span-2">
              <h2 className="app-section-title">Status Distribution</h2>
              <p className="app-meta-text mt-1">Across all tickets</p>

              <div className="mt-4 h-72 w-full">
                {hasStatusData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={98}
                        paddingAngle={3}
                      >
                        {statusChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={30} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                    No status data available
                  </div>
                )}
              </div>
            </section>

            <section className="app-panel xl:col-span-3">
              <h2 className="app-section-title">Priority Breakdown</h2>
              <p className="app-meta-text mt-1">Across all tickets</p>

              <div className="mt-4 h-72 w-full">
                {hasPriorityData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="priority" tick={{ fill: '#334155', fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#334155', fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                        {priorityChartData.map((entry) => (
                          <Cell key={entry.priority} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                    No priority data available
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
};

export { DashboardPage };
