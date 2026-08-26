import type { LucideIcon } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function EmptyState({ icon, title, description, children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <FeatureIcon icon={icon} size="lg" />
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
