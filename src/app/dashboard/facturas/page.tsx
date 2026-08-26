'use client';

import { useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { FileText, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { useFacturas, useIngestFactura } from '@/hooks/use-facturas';
import { useRevisionPendientes } from '@/hooks/use-revision';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  EstadoFacturaBadge,
  EstadoPagoBadge,
  OrigenBadge,
} from '@/components/facturas/estado-badges';
import { FacturaAcciones } from '@/components/facturas/factura-acciones';
import { FacturaRevisionBanner } from '@/components/facturas/factura-revision-banner';

export default function FacturasPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: facturas, isLoading } = useFacturas();
  const { data: revisionItems } = useRevisionPendientes();
  const ingest = useIngestFactura();

  const facturasEnRevision = useMemo(
    () => (facturas ?? []).filter((f) => f.estado === 'en_revision').length,
    [facturas]
  );

  const itemsRevision = useMemo(
    () =>
      (revisionItems ?? []).filter(
        (item) => item.entidad === 'factura' && item.estado === 'pendiente'
      ).length,
    [revisionItems]
  );

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    toast.promise(ingest.mutateAsync(file), {
      loading: 'Procesando factura...',
      success: (r) =>
        r.estado === 'confirmada'
          ? `Factura cargada y confirmada (${r.extraida.proveedorNombre ?? 'proveedor'}).`
          : `Factura cargada, necesita revisión: ${r.motivosRevision.join(', ')}.`,
      error: (err) => err.message,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeatureIcon icon={FileText} size="md" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Facturas</h1>
            <p className="text-sm text-muted-foreground">
              PDF, imagen o Excel. Lo dudoso va a Revisión.
            </p>
          </div>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={ingest.isPending}>
          {ingest.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Subir factura
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.xlsx,.xls,image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <FacturaRevisionBanner
        facturasEnRevision={facturasEnRevision}
        itemsRevision={itemsRevision}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !facturas || facturas.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Todavía no hay facturas. Subí la primera con el botón de arriba.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Saldo</th>
                <th className="px-4 py-3 font-medium">Origen</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Pago</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{f.numero ?? '—'}</td>
                  <td className="px-4 py-3">
                    {f.proveedor_nombre ?? (
                      <span className="text-muted-foreground italic">
                        {f.raw_proveedor_nombre ?? 'Sin identificar'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {f.fecha ? formatDate(f.fecha) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(f.total)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {f.estado === 'confirmada' ? formatCurrency(f.saldo) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <OrigenBadge origen={f.origen} />
                  </td>
                  <td className="px-4 py-3">
                    <EstadoFacturaBadge estado={f.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <EstadoPagoBadge estado={f.estado_pago} />
                  </td>
                  <td className="px-4 py-3">
                    <FacturaAcciones factura={f} />
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
