import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import type { GastoPorCategoria } from '@/types/categoria';

type GastoRubroChartProps = {
  data: GastoPorCategoria[];
};

const TOP_N = 5;

export function GastoRubroChart({ data }: GastoRubroChartProps) {
  const top = data.slice(0, TOP_N);
  const maxTotal = Math.max(1, ...top.map((row) => row.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gasto por categoría</CardTitle>
        <CardDescription>
          Facturas confirmadas.{' '}
          <Link href="/dashboard/categorias" className="text-primary hover:underline">
            Ver categorías
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay gasto categorizado para mostrar.
          </p>
        ) : (
          <div className="space-y-3">
            {top.map((row) => (
              <div key={row.categoria_id ?? row.categoria} className="flex items-center gap-3">
                <span
                  className="w-28 shrink-0 truncate text-xs text-muted-foreground"
                  title={row.categoria}
                >
                  {row.categoria}
                </span>
                <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
                  <div
                    className="h-full rounded bg-primary/70"
                    style={{ width: `${(row.total / maxTotal) * 100}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-xs tabular-nums">
                  {formatCurrency(row.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
