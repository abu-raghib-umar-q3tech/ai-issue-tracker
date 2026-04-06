interface AiBadgeProps {
  label?: string;
  compact?: boolean;
  className?: string;
}

const AiBadge = ({ label = 'AI Suggested', compact = false, className = '' }: AiBadgeProps) => {
  const sizeClassName = compact
    ? 'px-2.5 py-1 text-[0.65rem] tracking-[0.12em]'
    : 'px-3 py-1.5 text-[0.7rem] tracking-[0.14em]';
  const iconSizeClassName = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/90 font-semibold uppercase text-sky-800 shadow-sm backdrop-blur-sm',
        sizeClassName,
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className={[iconSizeClassName, 'flex-none text-sky-600'].join(' ')}
      >
        <path d="M10 2.5 11.5 6.5 15.5 8 11.5 9.5 10 13.5 8.5 9.5 4.5 8 8.5 6.5 10 2.5Z" fill="currentColor" />
        <path d="M15.5 2.5 16.1 4.1 17.7 4.7 16.1 5.3 15.5 6.9 14.9 5.3 13.3 4.7 14.9 4.1 15.5 2.5Z" fill="currentColor" opacity="0.7" />
        <path d="M4.5 11.1 5.1 12.7 6.7 13.3 5.1 13.9 4.5 15.5 3.9 13.9 2.3 13.3 3.9 12.7 4.5 11.1Z" fill="currentColor" opacity="0.7" />
      </svg>
      <span>{label}</span>
    </span>
  );
};

export { AiBadge };
