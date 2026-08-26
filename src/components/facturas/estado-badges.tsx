import { Badge } from '@/components/ui/badge';
import type { EstadoFactura, EstadoPago, OrigenFactura } from '@/types/factura';

export function EstadoFacturaBadge({ estado }: { estado: EstadoFactura }) {
  if (estado === 'en_revision') {
    return (
      <Badge className="bg-warning/15 text-warning" variant="secondary">
        En revisión
      </Badge>
    );
  }
  return (
    <Badge className="bg-success/15 text-success" variant="secondary">
      Confirmada
    </Badge>
  );
}

const PAGO_LABEL: Record<EstadoPago, string> = {
  sin_pagar: 'Sin pagar',
  parcial: 'Parcial',
  saldada: 'Saldada',
};

export function EstadoPagoBadge({ estado }: { estado: EstadoPago }) {
  const cls =
    estado === 'saldada'
      ? 'bg-success/15 text-success'
      : estado === 'parcial'
        ? 'bg-warning/15 text-warning'
        : 'bg-muted text-muted-foreground';
  return (
    <Badge variant="secondary" className={cls}>
      {PAGO_LABEL[estado]}
    </Badge>
  );
}

const ORIGEN_LABEL: Record<OrigenFactura, string> = {
  pdf: 'PDF',
  pdf_escaneado: 'Escaneado',
  excel: 'Excel',
  manual: 'Manual',
};

export function OrigenBadge({ origen }: { origen: OrigenFactura }) {
  return <Badge variant="outline">{ORIGEN_LABEL[origen]}</Badge>;
}
