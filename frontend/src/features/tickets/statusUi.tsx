import type { TicketStatus } from './types';

type StatusOption = TicketStatus | 'all';

const ticketStatusBadgeClassName: Record<TicketStatus, string> = {
  Todo:
    'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium tracking-[0.01em] text-slate-600 shadow-sm ring-1 ring-white/80',
  'In Progress':
    'inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium tracking-[0.01em] text-sky-700 shadow-sm ring-1 ring-white/80',
  Done:
    'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium tracking-[0.01em] text-emerald-700 shadow-sm ring-1 ring-white/80'
};

const ticketStatusDotClassName: Record<TicketStatus, string> = {
  Todo: 'h-2 w-2 rounded-full bg-slate-400',
  'In Progress': 'h-2 w-2 rounded-full bg-sky-400 animate-pulse',
  Done: 'h-2 w-2 rounded-full bg-emerald-400'
};

const ticketStatusSelectToneClassName: Record<StatusOption, string> = {
  all: 'border-slate-300 bg-white text-slate-900 focus:border-slate-500 focus:ring-slate-200',
  Todo: 'border-slate-200 bg-slate-50 text-slate-700 focus:border-slate-400 focus:ring-slate-200',
  'In Progress': 'border-sky-200 bg-sky-50 text-sky-700 focus:border-sky-400 focus:ring-sky-100',
  Done: 'border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400 focus:ring-emerald-100'
};

const getTicketStatusSelectClassName = (status: StatusOption): string => {
  return ['app-select font-medium shadow-none', ticketStatusSelectToneClassName[status]].join(' ');
};

const TicketStatusBadge = ({ status }: { status: TicketStatus }) => {
  return (
    <span className={ticketStatusBadgeClassName[status]}>
      <span aria-hidden="true" className={ticketStatusDotClassName[status]} />
      {status}
    </span>
  );
};

export { TicketStatusBadge, getTicketStatusSelectClassName };
