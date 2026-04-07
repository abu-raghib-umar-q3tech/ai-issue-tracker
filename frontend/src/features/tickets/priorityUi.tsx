import type { TicketPriority } from './types';

const ticketPriorityBadgeClassName: Record<TicketPriority, string> = {
  High:
    'inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 shadow-sm ring-1 ring-white/80',
  Medium:
    'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-sm ring-1 ring-white/80',
  Low:
    'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm ring-1 ring-white/80'
};

const ticketPriorityDotClassName: Record<TicketPriority, string> = {
  High: 'h-2 w-2 rounded-full bg-red-500',
  Medium: 'h-2 w-2 rounded-full bg-amber-500',
  Low: 'h-2 w-2 rounded-full bg-emerald-500'
};

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
}

const TicketPriorityBadge = ({ priority }: TicketPriorityBadgeProps) => {
  return (
    <span className={ticketPriorityBadgeClassName[priority]}>
      <span aria-hidden="true" className={ticketPriorityDotClassName[priority]} />
      {priority}
    </span>
  );
};

export { TicketPriorityBadge };
