import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <section className="app-panel text-center">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-8 w-8 text-slate-500"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 4.75h10a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6.75a2 2 0 0 1 2-2Z" />
            <path d="M8.5 9.25h7" />
            <path d="M8.5 12h7" />
            <path d="M8.5 14.75h4.5" />
          </svg>
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{description}</p>

        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </section>
  );
};

export { EmptyState };
