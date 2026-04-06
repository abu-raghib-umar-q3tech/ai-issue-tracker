interface SkeletonBlockProps {
  className?: string;
}

interface TicketListSkeletonProps {
  count?: number;
}

const SkeletonBlock = ({ className = '' }: SkeletonBlockProps) => {
  return <div aria-hidden="true" className={['skeleton-block', className].filter(Boolean).join(' ')} />;
};

const TicketCardSkeleton = () => {
  return (
    <article className="app-panel-hover" aria-hidden="true">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-7 w-52 max-w-full rounded-xl" />
            <SkeletonBlock className="h-6 w-24 rounded-full" />
          </div>

          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-full rounded-lg" />
            <SkeletonBlock className="h-4 w-[92%] rounded-lg" />
            <SkeletonBlock className="h-4 w-[68%] rounded-lg" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-6 w-28 rounded-full" />
            <SkeletonBlock className="h-6 w-24 rounded-full" />
          </div>

          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-7 w-20 rounded-full" />
            <SkeletonBlock className="h-7 w-24 rounded-full" />
            <SkeletonBlock className="h-7 w-16 rounded-full" />
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 lg:w-56">
          <SkeletonBlock className="mb-2 h-3 w-16 rounded-lg" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="mt-2 h-3 w-28 rounded-lg" />
        </div>
      </div>
    </article>
  );
};

const TicketListSkeleton = ({ count = 4 }: TicketListSkeletonProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <TicketCardSkeleton key={index} />
      ))}
    </div>
  );
};

const MetricCardSkeleton = () => {
  return (
    <article className="app-panel-hover" aria-hidden="true">
      <SkeletonBlock className="h-1.5 w-14 rounded-full" />
      <SkeletonBlock className="mt-3 h-3 w-24 rounded-lg" />
      <SkeletonBlock className="mt-2 h-10 w-20 rounded-xl" />
    </article>
  );
};

const ChartPanelSkeleton = ({ variant }: { variant: 'pie' | 'bar' }) => {
  return (
    <section className="app-panel" aria-hidden="true">
      <SkeletonBlock className="h-6 w-44 rounded-xl" />
      <SkeletonBlock className="mt-2 h-4 w-32 rounded-lg" />

      <div className="mt-4 h-72 w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-5">
        {variant === 'pie' ? (
          <div className="flex h-full items-center justify-center">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <SkeletonBlock className="h-44 w-44 rounded-full" />
              <div className="absolute h-20 w-20 rounded-full bg-slate-50/95" />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-end justify-between gap-3">
            <SkeletonBlock className="h-28 w-full rounded-t-2xl" />
            <SkeletonBlock className="h-40 w-full rounded-t-2xl" />
            <SkeletonBlock className="h-52 w-full rounded-t-2xl" />
          </div>
        )}
      </div>
    </section>
  );
};

const DashboardSkeleton = () => {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <ChartPanelSkeleton variant="pie" />
        </div>

        <div className="xl:col-span-3">
          <ChartPanelSkeleton variant="bar" />
        </div>
      </div>
    </>
  );
};

export { DashboardSkeleton, TicketListSkeleton };
