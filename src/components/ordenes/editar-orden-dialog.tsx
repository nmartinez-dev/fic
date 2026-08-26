'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconTooltip, iconButtonClassName } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateOrden, useUploadOrdenArchivo } from '@/hooks/use-ordenes';
import { useProveedores } from '@/hooks/use-proveedores';
import { OrdenArchivoField } from '@/components/ordenes/orden-archivo-field';
import type { OrdenCompraConProveedor, UpdateOrdenInput } from '@/types/orden';

const SIN_PROVEEDOR = '__none__';

export function EditarOrdenDialog({ orden }: { orden: OrdenCompraConProveedor }) {
  const [open, setOpen] = useState(false);
  const [proveedorId, setProveedorId] = useState(orden.proveedor_id ?? SIN_PROVEEDOR);
  const [numero, setNumero] = useState(orden.numero ?? '');
  const [fecha, setFecha] = useState(orden.fecha);
  const [total, setTotal] = useState(String(orden.total));
  const [descripcion, setDescripcion] = useState(orden.descripcion ?? '');
  const [notas, setNotas] = useState(orden.notas ?? '');
  const [archivo, setArchivo] = useState<File | null>(null);

  const update = useUpdateOrden();
  const uploadArchivo = useUploadOrdenArchivo();
  const { data: proveedores } = useProveedores();

  useEffect(() => {
    if (!open) return;
    setProveedorId(orden.proveedor_id ?? SIN_PROVEEDOR);
    setNumero(orden.numero ?? '');
    setFecha(orden.fecha);
    setTotal(String(orden.total));
    setDescripcion(orden.descripcion ?? '');
    setNotas(orden.notas ?? '');
    setArchivo(null);
  }, [open, orden]);

  const totalNum = Number(total);
  const invalido = !Number.isFinite(totalNum) || totalNum < 0;

  const submit = async () => {
    const input: UpdateOrdenInput = {
      proveedor_id: proveedorId === SIN_PROVEEDOR ? null : proveedorId,
      numero: numero.trim() || null,
      fecha,
      total: totalNum,
      descripcion: descripcion.trim() || null,
      notas: notas.trim() || null,
    };

    const tarea = (async () => {
      await update.mutateAsync({ id: orden.id, input });
      if (archivo) {
        await uploadArchivo.mutateAsync({ id: orden.id, file: archivo });
      }
    })();

    toast.promise(tarea, {
      loading: 'Guardando...',
      success: () => {
        setOpen(false);
        return archivo ? 'Orden y documento actualizados.' : 'Orden actualizada.';
      },
      error: (e) => (e as Error).message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <IconTooltip label="Editar orden">
        <DialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={iconButtonClassName}
            aria-label="Editar orden"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      </IconTooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar orden de compra</DialogTitle>
          <DialogDescription>
            Corregí los datos del pedido. El estado se cambia desde la tabla.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Proveedor</Label>
            <Select value={proveedorId} onValueChange={setProveedorId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sin proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_PROVEEDOR}>Sin proveedor</SelectItem>
                {(proveedores ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`orden-numero-${orden.id}`}>Número</Label>
              <Input
                id={`orden-numero-${orden.id}`}
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`orden-fecha-${orden.id}`}>Fecha</Label>
              <Input
                id={`orden-fecha-${orden.id}`}
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`orden-total-${orden.id}`}>Total estimado</Label>
            <Input
              id={`orden-total-${orden.id}`}
              type="number"
              min="0"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`orden-desc-${orden.id}`}>Descripción</Label>
            <Input
              id={`orden-desc-${orden.id}`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`orden-notas-${orden.id}`}>Notas</Label>
            <Input
              id={`orden-notas-${orden.id}`}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones internas"
            />
          </div>
          <OrdenArchivoField
            id={`orden-archivo-edit-${orden.id}`}
            file={archivo}
            archivoPath={orden.archivo_path}
            onFileChange={setArchivo}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={invalido || update.isPending || uploadArchivo.isPending}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
