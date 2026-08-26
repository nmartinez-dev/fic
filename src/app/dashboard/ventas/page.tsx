'use client';

import { useMemo } from 'react';
import { TrendingUp, AlertTriangle, Copy, Ban } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useVentas } from '@/hooks/use-ventas';
import { formatCurrency } from '@/lib/format';
import type { EstadoDato, Venta } from '@/types/venta';

const MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function mesLabel(ym: string): string {
  const [y, m] = ym.split('-');
  return `${MESES_CORTOS[Number(m) - 1]} ${y}`;
}

const FLAG_META: Record<
  Exclude<EstadoDato, 'valida'>,
  { label: string; cls: string; icon: typeof Copy }
> = {
  duplicada: { label: 'Duplicada', cls: 'bg-warning/15 text-warning', icon: Copy },
  rota: { label: 'Dato roto', cls: 'bg-danger/15 text-danger', icon: Ban },
};

export default function VentasPage() {
  const { data: ventas, isLoading } = useVentas();

  const stats = useMemo(() => {
    const list = ventas ?? [];
    const validas = list.filter((v) => v.estado_dato === 'valida');
    const flagged = list.filter((v) => v.estado_dato !== 'valida');
    const totalFacturado = validas.reduce((acc, v) => acc + (v.total ?? 0), 0);

    const porMes = new Map<string, number>();
    for (const v of validas) {
      if (!v.fecha) continue;
      const ym = v.fecha.slice(0, 7);
      porMes.set(ym, (porMes.get(ym) ?? 0) + (v.total ?? 0));
    }
    const meses = [...porMes.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, total]) => ({ ym, total }));
    const maxMes = Math.max(1, ...meses.map((m) => m.total));

    return { validas, flagged, totalFacturado, meses, maxMes };
  }, [ventas]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={TrendingUp} size="md" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Cómo venís mes a mes. Las ventas duplicadas o rotas se avisan aparte,
            no se suman como válidas.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Facturación válida</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatCurrency(stats.totalFacturado)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {stats.validas.length} ventas contabilizadas
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Duplicadas detectadas</CardDescription>
            <CardTitle className="text-2xl tabular-nums text-warning">
              {stats.flagged.filter((v) => v.estado_dato === 'duplicada').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            No se suman al total
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Filas rotas</CardDescription>
            <CardTitle className="text-2xl tabular-nums text-danger">
              {stats.flagged.filter((v) => v.estado_dato === 'rota').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Necesitan corrección manual
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Facturación por mes</CardTitle>
          <CardDescription>Solo ventas válidas.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.meses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay ventas válidas para graficar.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.meses.map((m) => (
                <div key={m.ym} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-muted-foreground">
                    {mesLabel(m.ym)}
                  </span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="h-full rounded bg-primary/70"
                      style={{ width: `${(m.total / stats.maxMes) * 100}%` }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right text-xs tabular-nums">
                    {formatCurrency(m.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <CardTitle className="text-base">
              Ventas marcadas ({stats.flagged.length})
            </CardTitle>
          </div>
          <CardDescription>
            Detectadas al importar. Se listan para revisar, no se contabilizan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.flagged.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No se detectaron ventas con problemas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 font-medium">Código</th>
                    <th className="py-2 font-medium">Producto</th>
                    <th className="py-2 font-medium">Motivo</th>
                    <th className="py-2 font-medium">Marca</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.flagged.map((v) => (
                    <FlaggedRow key={v.id} v={v} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FlaggedRow({ v }: { v: Venta }) {
  if (v.estado_dato === 'valida') return null;
  const meta = FLAG_META[v.estado_dato];
  const Icon = meta.icon;
  return (
    <tr className="border-t">
      <td className="py-2 font-medium">{v.codigo ?? '—'}</td>
      <td className="py-2">{v.producto ?? '—'}</td>
      <td className="py-2 text-muted-foreground">{v.motivo_flag ?? '—'}</td>
      <td className="py-2">
        <Badge variant="secondary" className={meta.cls}>
          <Icon className="mr-1 h-3 w-3" />
          {meta.label}
        </Badge>
      </td>
    </tr>
  );
}
