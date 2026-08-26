'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Bell, CheckCircle2, RotateCcw } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAvisos, useResolverAviso, useReabrirAviso } from '@/hooks/use-avisos';
import {
  hrefForAviso,
  TIPO_CLS,
  TIPO_LABEL,
} from '@/lib/notificaciones/aviso-meta';
import { formatDate } from '@/lib/format';
import type { Aviso } from '@/types/aviso';

export default function AvisosPage() {
  const { data: avisos, isLoading } = useAvisos();
  const resolver = useResolverAviso();
  const reabrir = useReabrirAviso();

  const pendientes = (avisos ?? []).filter((a) => a.estado === 'pendiente');
  const resueltos = (avisos ?? []).filter((a) => a.estado === 'resuelto');

  const run = (p: Promise<unknown>, ok: string) =>
    toast.promise(p, {
      loading: 'Guardando…',
      success: ok,
      error: (e) => (e as Error).message,
    });

  const renderAviso = (a: Aviso) => (
    <Card key={a.id}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{a.titulo}</CardTitle>
          <Badge variant="secondary" className={TIPO_CLS[a.tipo]}>
            {TIPO_LABEL[a.tipo]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {a.cuerpo && (
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {a.cuerpo}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {formatDate(a.fecha)}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={hrefForAviso(a)}>Ir a la pantalla</Link>
            </Button>
            {a.estado === 'pendiente' ? (
              <Button
                size="sm"
                disabled={resolver.isPending}
                onClick={() => run(resolver.mutateAsync(a.id), 'Aviso resuelto.')}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marcar resuelto
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={reabrir.isPending}
                onClick={() => run(reabrir.mutateAsync(a.id), 'Aviso reabierto.')}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reabrir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={Bell} size="md" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Avisos</h1>
          <p className="text-sm text-muted-foreground">
            Historial completo de avisos. Para el día a día usá la campana del
            header.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (avisos ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No hay avisos.
        </div>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Pendientes ({pendientes.length})
            </h2>
            {pendientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nada pendiente. Todo resuelto.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {pendientes.map(renderAviso)}
              </div>
            )}
          </section>

          {resueltos.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Resueltos ({resueltos.length})
              </h2>
              <div className="grid gap-3 opacity-70 sm:grid-cols-2">
                {resueltos.map(renderAviso)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
