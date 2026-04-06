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

const MetricCard = ({ label, value, accentClass, valueClass }: MetricCardProps) => {
  return (
    <article className="app-panel-hover">
      <div className={`h-1.5 w-14 rounded-full ${accentClass}`} aria-hidden="true" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</p>
    </article>
  );
};

const DashboardPage = () => {
  const baseQuery = { page: 1, limit: 1 } as const;

  const totalQuery = useGetTicketsQuery(baseQuery);
  const completedQuery = useGetTicketsQuery({ ...baseQuery, status: 'Done' });
  const todoQuery = useGetTicketsQuery({ ...baseQuery, status: 'Todo' });
  const inProgressQuery = useGetTicketsQuery({ ...baseQuery, status: 'In Progress' });

  const lowPriorityQuery = useGetTicketsQuery({ ...baseQuery, priority: 'Low' });
  const mediumPriorityQuery = useGetTicketsQuery({ ...baseQuery, priority: 'Medium' });
  const highPriorityQuery = useGetTicketsQuery({ ...baseQuery, priority: 'High' });

  const queries = [
    totalQuery,
    completedQuery,
    todoQuery,
    inProgressQuery,
    lowPriorityQuery,
    mediumPriorityQuery,
    highPriorityQuery
  ];

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const dashboardError = queries.find((query) => query.error)?.error;
  const hasResolvedInitialLoad = queries.every((query) => query.data !== undefined || query.isError);
  const showInitialSkeleton = useInitialLoadSkeleton(isLoading && !isError, hasResolvedInitialLoad || isError);

  const totalTickets = totalQuery.data?.total ?? 0;
  const completedTickets = completedQuery.data?.total ?? 0;
  const todoTickets = todoQuery.data?.total ?? 0;
  const inProgressTickets = inProgressQuery.data?.total ?? 0;
  const pendingTickets = todoTickets + inProgressTickets;

  const statusChartData: StatusChartDatum[] = [
    { name: 'Done', value: completedTickets, fill: STATUS_COLORS.Done },
    { name: 'In Progress', value: inProgressTickets, fill: STATUS_COLORS['In Progress'] },
    { name: 'Todo', value: todoTickets, fill: STATUS_COLORS.Todo }
  ];

  const priorityChartData: PriorityChartDatum[] = [
    {
      priority: 'Low',
      count: lowPriorityQuery.data?.total ?? 0,
      fill: PRIORITY_COLORS.Low
    },
    {
      priority: 'Medium',
      count: mediumPriorityQuery.data?.total ?? 0,
      fill: PRIORITY_COLORS.Medium
    },
    {
      priority: 'High',
      count: highPriorityQuery.data?.total ?? 0,
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

      {isError ? <ApiErrorAlert error={dashboardError} fallbackMessage="Failed to load dashboard metrics." /> : null}

      {showInitialSkeleton ? <DashboardSkeleton /> : null}

      {!showInitialSkeleton && !isLoading && !isError ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Total Tickets" value={totalTickets} accentClass="bg-slate-900" valueClass="text-slate-900" />
            <MetricCard
              label="Completed"
              value={completedTickets}
              accentClass="bg-emerald-500"
              valueClass="text-emerald-700"
            />
            <MetricCard label="Pending" value={pendingTickets} accentClass="bg-amber-500" valueClass="text-amber-700" />
          </div>

          <div className="grid gap-7 xl:grid-cols-5">
            <section className="app-panel xl:col-span-2">
              <h2 className="app-section-title">Status Distribution</h2>
              <p className="app-meta-text mt-1">Pie chart by ticket status</p>

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
              <p className="app-meta-text mt-1">Bar chart by ticket priority</p>

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
