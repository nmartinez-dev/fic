import type { LucideIcon } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
};

/** Placeholder de una sección aún no implementada. Se reemplaza por fase. */
export function PlaceholderPage({ icon, title, description }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={icon} size="md" />
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
