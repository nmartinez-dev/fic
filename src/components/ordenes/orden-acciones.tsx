'use client';

import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconTooltip, iconButtonClassName } from '@/components/ui/icon-button';
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
import { useDeleteOrden } from '@/hooks/use-ordenes';
import type { OrdenCompraConProveedor } from '@/types/orden';
import { EditarOrdenDialog } from '@/components/ordenes/editar-orden-dialog';

export function OrdenAcciones({ orden }: { orden: OrdenCompraConProveedor }) {
  const eliminar = useDeleteOrden();

  const confirmDelete = () => {
    toast.promise(eliminar.mutateAsync(orden.id), {
      loading: 'Eliminando...',
      success: 'Orden eliminada.',
      error: (e) => (e as Error).message,
    });
  };

  const etiqueta = orden.numero ?? 'esta orden';

  return (
    <div className="flex justify-end gap-1">
      <EditarOrdenDialog orden={orden} />
      <AlertDialog>
        <IconTooltip label="Eliminar orden">
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className={iconButtonClassName}
              aria-label="Eliminar orden"
              disabled={eliminar.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
        </IconTooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar orden?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará <span className="font-medium">{etiqueta}</span> y su
              historial. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
