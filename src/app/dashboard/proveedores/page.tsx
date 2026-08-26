'use client';

import { Building2 } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useCuentaCorriente } from '@/hooks/use-proveedores';
import { formatCurrency } from '@/lib/format';

export default function ProveedoresPage() {
  const { data: cuentas, isLoading } = useCuentaCorriente();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={Building2} size="md" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Cada proveedor unificado, con lo que le comprás, lo que le pagaste y
            lo que le debés.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !cuentas || cuentas.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Todavía no hay proveedores cargados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium">Términos</th>
                <th className="px-4 py-3 text-right font-medium">Comprado</th>
                <th className="px-4 py-3 text-right font-medium">Pagado</th>
                <th className="px-4 py-3 text-right font-medium">Saldo (debo)</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((c) => (
                <tr key={c.proveedor_id} className="border-t">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{c.terminos_pago_dias} días</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(c.total_comprado)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(c.total_pagado)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    <span className={c.saldo > 0 ? 'text-danger' : 'text-success'}>
                      {formatCurrency(c.saldo)}
                    </span>
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
