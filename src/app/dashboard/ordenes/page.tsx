'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ClipboardList, Plus } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrdenes, useCreateOrden, useUpdateEstadoOrden } from '@/hooks/use-ordenes';
import { useProveedores } from '@/hooks/use-proveedores';
import { formatCurrency, formatDate, todayISO } from '@/lib/format';
import type { EstadoOrden } from '@/types/orden';

const ESTADOS: EstadoOrden[] = ['pendiente', 'parcial', 'recibida', 'cancelada'];
const ESTADO_LABEL: Record<EstadoOrden, string> = {
  pendiente: 'Pendiente',
  parcial: 'Recibida parcial',
  recibida: 'Recibida',
  cancelada: 'Cancelada',
};
const ESTADO_CLS: Record<EstadoOrden, string> = {
  pendiente: 'text-warning',
  parcial: 'text-warning',
  recibida: 'text-success',
  cancelada: 'text-muted-foreground',
};

export default function OrdenesPage() {
  const { data: ordenes, isLoading } = useOrdenes();
  const updateEstado = useUpdateEstadoOrden();

  const cambiarEstado = (id: string, estado: EstadoOrden) => {
    toast.promise(updateEstado.mutateAsync({ id, estado }), {
      loading: 'Actualizando...',
      success: 'Estado actualizado.',
      error: (e) => (e as Error).message,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeatureIcon icon={ClipboardList} size="md" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Órdenes de compra
            </h1>
            <p className="text-sm text-muted-foreground">
              Cada pedido con su estado, para no pedir dos veces lo mismo ni
              perder de vista lo que falta recibir.
            </p>
          </div>
        </div>
        <NuevaOrdenDialog />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !ordenes || ordenes.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Todavía no hay órdenes de compra. Creá la primera con el botón de
          arriba.
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
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{o.numero ?? '—'}</td>
                  <td className="px-4 py-3">
                    {o.proveedor?.nombre ?? (
                      <span className="text-muted-foreground italic">
                        Sin proveedor
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(o.fecha)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(o.total)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.descripcion ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.estado}
                      onValueChange={(v) => cambiarEstado(o.id, v as EstadoOrden)}
                    >
                      <SelectTrigger size="sm" className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((e) => (
                          <SelectItem key={e} value={e}>
                            <span className={ESTADO_CLS[e]}>
                              {ESTADO_LABEL[e]}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

function NuevaOrdenDialog() {
  const [open, setOpen] = useState(false);
  const [proveedorId, setProveedorId] = useState<string>('');
  const [numero, setNumero] = useState('');
  const [fecha, setFecha] = useState(todayISO());
  const [total, setTotal] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const { data: proveedores } = useProveedores();
  const crear = useCreateOrden();

  const reset = () => {
    setProveedorId('');
    setNumero('');
    setFecha(todayISO());
    setTotal('');
    setDescripcion('');
  };

  const submit = () => {
    const p = crear.mutateAsync({
      proveedor_id: proveedorId || null,
      numero: numero.trim() || null,
      fecha,
      total: Number(total) || 0,
      descripcion: descripcion.trim() || null,
    });
    toast.promise(p, {
      loading: 'Creando orden...',
      success: () => {
        setOpen(false);
        reset();
        return 'Orden creada.';
      },
      error: (e) => (e as Error).message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva orden
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva orden de compra</DialogTitle>
          <DialogDescription>
            Registrá un pedido para poder seguirlo hasta que se reciba.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Proveedor</Label>
            <Select value={proveedorId} onValueChange={setProveedorId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegí un proveedor" />
              </SelectTrigger>
              <SelectContent>
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
              <Label htmlFor="oc-numero">Número</Label>
              <Input
                id="oc-numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="OC-103"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="oc-fecha">Fecha</Label>
              <Input
                id="oc-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="oc-total">Total estimado</Label>
            <Input
              id="oc-total"
              type="number"
              min="0"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="oc-desc">Descripción</Label>
            <Input
              id="oc-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Qué se pidió"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={crear.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={submit} disabled={crear.isPending}>
            Crear orden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
