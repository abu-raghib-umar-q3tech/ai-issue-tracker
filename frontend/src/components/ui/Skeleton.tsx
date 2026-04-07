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
    <article className="app-panel-hover overflow-hidden" aria-hidden="true">
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <SkeletonBlock className="h-6 w-48 max-w-full rounded-lg" />
            <SkeletonBlock className="h-5 w-24 rounded-full" />
          </div>
          <SkeletonBlock className="h-4 w-20 shrink-0 rounded-md" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-5 w-16 rounded-full" />
          <SkeletonBlock className="h-5 w-28 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <SkeletonBlock className="h-4 w-full rounded-lg" />
          <SkeletonBlock className="h-4 w-[85%] rounded-lg" />
        </div>
        <div className="flex gap-1.5">
          <SkeletonBlock className="h-5 w-14 rounded-full" />
          <SkeletonBlock className="h-5 w-20 rounded-full" />
          <SkeletonBlock className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-12 rounded-md" />
          <SkeletonBlock className="h-8 w-32 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-24 rounded-xl" />
          <SkeletonBlock className="h-8 w-16 rounded-xl" />
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
      <div className="flex items-start justify-between gap-3">
        <SkeletonBlock className="h-3 w-20 rounded-lg" />
        <SkeletonBlock className="h-8 w-8 flex-none rounded-lg" />
      </div>
      <SkeletonBlock className="mt-3 h-9 w-16 rounded-xl" />
      <SkeletonBlock className="mt-4 h-0.5 w-full rounded-full" />
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
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCardSkeleton />
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
