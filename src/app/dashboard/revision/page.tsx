'use client';

import { Inbox, CheckCircle2 } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useRevisionPendientes } from '@/hooks/use-revision';
import { RevisionCard } from '@/components/revision/revision-card';

export default function RevisionPage() {
  const { data: items, isLoading } = useRevisionPendientes();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={Inbox} size="md" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Revisión</h1>
          <p className="text-sm text-muted-foreground">
            Lo que el sistema no pudo resolver solo. En vez de adivinar, decidís vos.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <p className="mt-3 text-sm text-muted-foreground">
            No hay nada pendiente de revisión. Todo en orden.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <RevisionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
