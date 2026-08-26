'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type OrdenesPendientesBannerProps = {
  pendientes: number;
  onVerPendientes: () => void;
};

export function OrdenesPendientesBanner({
  pendientes,
  onVerPendientes,
}: OrdenesPendientesBannerProps) {
  if (pendientes === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="space-y-1 text-sm">
          <p className="font-medium text-foreground">
            Hay pedidos sin cerrar
          </p>
          <p className="text-muted-foreground">
            {pendientes} orden{pendientes > 1 ? 'es' : ''} en pendiente o recibida
            parcial — revisá si falta mercadería por llegar.
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 self-start"
        onClick={onVerPendientes}
      >
        Ver pendientes
      </Button>
    </div>
  );
}
