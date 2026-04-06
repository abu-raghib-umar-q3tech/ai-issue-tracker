import type { TicketPriority } from './types';

const ticketPriorityBadgeClassName: Record<TicketPriority, string> = {
  High:
    'inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-100 px-3.5 py-1.5 text-sm font-semibold text-red-800 shadow-sm ring-1 ring-white/80',
  Medium:
    'inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-3.5 py-1.5 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-white/80',
  Low:
    'inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3.5 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm ring-1 ring-white/80'
};

const ticketPriorityDotClassName: Record<TicketPriority, string> = {
  High: 'bg-red-500',
  Medium: 'bg-amber-500',
  Low: 'bg-emerald-500'
};

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  showLabel?: boolean;
}

const TicketPriorityBadge = ({ priority, showLabel = false }: TicketPriorityBadgeProps) => {
  return (
    <span className={ticketPriorityBadgeClassName[priority]}>
      <span
        aria-hidden="true"
        className={['h-2.5 w-2.5 rounded-full', ticketPriorityDotClassName[priority]].join(' ')}
      />
      {priority}
      {showLabel ? ' Priority' : ''}
    </span>
  );
};

export { TicketPriorityBadge };
