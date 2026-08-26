import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type KpiStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  href: string;
  icon: LucideIcon;
  accent?: 'default' | 'warning' | 'danger';
};

const accentBorder: Record<NonNullable<KpiStatCardProps['accent']>, string> = {
  default: 'hover:border-primary/50',
  warning: 'border-warning/40 hover:border-warning/60',
  danger: 'border-danger/40 hover:border-danger/60',
};

const accentValue: Record<NonNullable<KpiStatCardProps['accent']>, string> = {
  default: '',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function KpiStatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  accent = 'default',
}: KpiStatCardProps) {
  return (
    <Link href={href} className="cursor-pointer">
      <Card
        className={cn(
          'h-full cursor-pointer transition-colors',
          accentBorder[accent]
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardDescription>{label}</CardDescription>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          </div>
          <CardTitle
            className={cn('text-2xl tabular-nums tracking-tight', accentValue[accent])}
          >
            {value}
          </CardTitle>
        </CardHeader>
        {hint ? (
          <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>
        ) : null}
      </Card>
    </Link>
  );
}
