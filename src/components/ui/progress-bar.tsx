import { cn } from '@/lib/utils';

type Props = {
  value: number;
  className?: string;
  indicatorClassName?: string;
};

export function ProgressBar({ value, className, indicatorClassName }: Props) {
  const pct = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-muted',
        className
      )}
    >
      <div
        className={cn('h-full rounded-full transition-all', indicatorClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
