'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconButton, IconTooltip, iconButtonClassName } from '@/components/ui/icon-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteFactura } from '@/hooks/use-facturas';
import { getFacturaArchivoUrl } from '@/services/factura-service';
import { formatCurrency } from '@/lib/format';
import type { FacturaConSaldo } from '@/types/factura';
import { EditarFacturaDialog } from '@/components/facturas/editar-factura-dialog';
import { RegistrarPagoDialog } from '@/components/facturas/registrar-pago-dialog';

function tooltipRegistrarPago(factura: FacturaConSaldo): string {
  if (factura.estado !== 'confirmada') {
    return 'Registrar pago — disponible solo en facturas confirmadas';
  }
  if (factura.saldo <= 0) {
    return 'Registrar pago — no hay saldo pendiente';
  }
  return 'Registrar pago';
}

export function FacturaAcciones({ factura }: { factura: FacturaConSaldo }) {
  const [abriendoArchivo, setAbriendoArchivo] = useState(false);
  const eliminar = useDeleteFactura();

  const verArchivo = async () => {
    setAbriendoArchivo(true);
    try {
      const url = await getFacturaArchivoUrl(factura.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAbriendoArchivo(false);
    }
  };

  const confirmarEliminar = () => {
    toast.promise(eliminar.mutateAsync(factura.id), {
      loading: 'Eliminando factura…',
      success: 'Factura eliminada.',
      error: (e) => (e as Error).message,
    });
  };

  const tienePagos = factura.pagado > 0;
  const puedeRegistrarPago =
    factura.estado === 'confirmada' && factura.saldo > 0;
  const docTooltip = factura.archivo_path
    ? 'Ver documento original'
    : 'Ver documento — no hay archivo guardado';

  return (
    <div className="flex items-center justify-end gap-1">
      <RegistrarPagoDialog
        factura={factura}
        disabled={!puedeRegistrarPago}
        tooltip={tooltipRegistrarPago(factura)}
      />

      <IconButton
        tooltip={docTooltip}
        disabled={!factura.archivo_path || abriendoArchivo}
        onClick={verArchivo}
      >
        <ExternalLink className="h-4 w-4" />
      </IconButton>

      <EditarFacturaDialog factura={factura} />

      <AlertDialog>
        <IconTooltip label="Eliminar factura">
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className={iconButtonClassName}
              aria-label="Eliminar factura"
              disabled={eliminar.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
        </IconTooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará la factura{' '}
              <span className="font-medium text-foreground">
                {factura.numero ?? 'sin número'}
              </span>
              {factura.proveedor_nombre
                ? ` de ${factura.proveedor_nombre}`
                : ''}
              . También se eliminan pagos, vencimientos e ítems de revisión
              asociados.
              {tienePagos && (
                <>
                  {' '}
                  Ya tiene {formatCurrency(factura.pagado)} registrados en pagos.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminar}
              disabled={eliminar.isPending}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
