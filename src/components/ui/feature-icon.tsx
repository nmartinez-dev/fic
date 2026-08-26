import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: { container: 'h-9 w-9', icon: 'h-4 w-4' },
  md: { container: 'h-10 w-10', icon: 'h-5 w-5' },
  lg: { container: 'h-14 w-14', icon: 'h-7 w-7' },
} as const;

type FeatureIconSize = keyof typeof sizeClasses;

type FeatureIconProps = {
  icon: LucideIcon;
  size?: FeatureIconSize;
  className?: string;
};

export function FeatureIcon({
  icon: Icon,
  size = 'md',
  className,
}: FeatureIconProps) {
  const { container, icon: iconSize } = sizeClasses[size];

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary',
        container,
        className
      )}
    >
      <Icon className={iconSize} />
    </span>
  );
}
