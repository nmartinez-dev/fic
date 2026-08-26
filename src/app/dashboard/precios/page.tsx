'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Tag, RefreshCw, Search } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { usePrecios, useSyncPrecios } from '@/hooks/use-precios';
import { formatCurrency, formatDate } from '@/lib/format';

export default function PreciosPage() {
  const { data, isLoading, isError, error } = usePrecios();
  const sync = useSyncPrecios();
  const [q, setQ] = useState('');

  const precios = data?.precios ?? [];
  const fechaLista = data?.fechaLista ?? null;

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return precios;
    return precios.filter(
      (p) =>
        p.codigo_producto.toLowerCase().includes(term) ||
        (p.descripcion?.toLowerCase().includes(term) ?? false) ||
        (p.categoria?.toLowerCase().includes(term) ?? false)
    );
  }, [precios, q]);

  const handleSync = () => {
    toast.promise(sync.mutateAsync(), {
      loading: 'Actualizando lista del proveedor…',
      success: (r) =>
        `Lista del ${formatDate(r.fecha)}: ${r.total} productos actualizados.`,
      error: (e) => (e as Error).message,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={Tag} size="md" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Precios</h1>
          <p className="text-sm text-muted-foreground">
            Lista del proveedor grande, actualizada desde el portal.
            {fechaLista && (
              <>
                {' '}
                Última lista:{' '}
                <span className="font-medium text-foreground">
                  {formatDate(fechaLista)}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Buscar por código, descripción o categoría…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={handleSync}
          disabled={sync.isPending}
          className="shrink-0 sm:ml-auto"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${sync.isPending ? 'animate-spin' : ''}`}
          />
          Actualizar ahora
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/5 py-16 text-center text-sm text-danger">
          {(error as Error).message}
        </div>
      ) : precios.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Todavía no hay precios cargados. Usá{' '}
          <span className="font-medium text-foreground">Actualizar ahora</span>{' '}
          para traer la lista del portal.
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Ningún producto coincide con la búsqueda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium text-right">Precio</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{p.codigo_producto}</td>
                  <td className="px-4 py-3">{p.descripcion ?? '—'}</td>
                  <td className="px-4 py-3">
                    {p.categoria ? (
                      <Badge variant="secondary">{p.categoria}</Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(p.precio)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {p.stock ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
