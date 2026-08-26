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
import { useDeleteOrden } from '@/hooks/use-ordenes';
import { getOrdenArchivoUrl } from '@/services/orden-service';
import type { OrdenCompraConProveedor } from '@/types/orden';
import { EditarOrdenDialog } from '@/components/ordenes/editar-orden-dialog';

export function OrdenAcciones({ orden }: { orden: OrdenCompraConProveedor }) {
  const [abriendoArchivo, setAbriendoArchivo] = useState(false);
  const eliminar = useDeleteOrden();

  const verArchivo = async () => {
    setAbriendoArchivo(true);
    try {
      const url = await getOrdenArchivoUrl(orden.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAbriendoArchivo(false);
    }
  };

  const confirmDelete = () => {
    toast.promise(eliminar.mutateAsync(orden.id), {
      loading: 'Eliminando...',
      success: 'Orden eliminada.',
      error: (e) => (e as Error).message,
    });
  };

  const etiqueta = orden.numero ?? 'esta orden';
  const docTooltip = orden.archivo_path
    ? 'Ver documento adjunto'
    : 'Ver documento — no hay archivo adjunto';

  return (
    <div className="flex justify-end gap-1">
      <IconButton
        tooltip={docTooltip}
        disabled={!orden.archivo_path || abriendoArchivo}
        onClick={verArchivo}
      >
        <ExternalLink className="h-4 w-4" />
      </IconButton>
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
              Se borrará <span className="font-medium">{etiqueta}</span>, su
              documento adjunto y su historial. Esta acción no se puede deshacer.
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
