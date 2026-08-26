'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FacturaRevisionBannerProps = {
  facturasEnRevision: number;
  itemsRevision: number;
};

export function FacturaRevisionBanner({
  facturasEnRevision,
  itemsRevision,
}: FacturaRevisionBannerProps) {
  if (facturasEnRevision === 0 && itemsRevision === 0) return null;

  const partes: string[] = [];
  if (facturasEnRevision > 0) {
    partes.push(
      `${facturasEnRevision} factura${facturasEnRevision > 1 ? 's' : ''} en revisión`
    );
  }
  if (itemsRevision > 0) {
    partes.push(
      `${itemsRevision} ítem${itemsRevision > 1 ? 's' : ''} pendiente${itemsRevision > 1 ? 's' : ''}`
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="space-y-1 text-sm">
          <p className="font-medium text-foreground">
            Hay facturas que necesitan una decisión
          </p>
          <p className="text-muted-foreground">{partes.join(' · ')}.</p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 self-start">
        <Link href="/dashboard/revision">Ir a Revisión</Link>
      </Button>
    </div>
  );
}
