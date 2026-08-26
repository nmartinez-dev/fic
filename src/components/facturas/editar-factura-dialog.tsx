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
import { useUpdateFactura } from '@/hooks/use-facturas';
import { useProveedores } from '@/hooks/use-proveedores';
import { useRubrosConAlias } from '@/hooks/use-rubros';
import type { FacturaConSaldo, UpdateFacturaInput } from '@/types/factura';

const SIN_PROVEEDOR = '__none__';
const SIN_RUBRO = '__none__';

export function EditarFacturaDialog({ factura }: { factura: FacturaConSaldo }) {
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState(factura.numero ?? '');
  const [fecha, setFecha] = useState(factura.fecha ?? '');
  const [fechaVencimiento, setFechaVencimiento] = useState(
    factura.fecha_vencimiento ?? ''
  );
  const [total, setTotal] = useState(String(factura.total));
  const [proveedorId, setProveedorId] = useState(
    factura.proveedor_id ?? SIN_PROVEEDOR
  );
  const [rubroId, setRubroId] = useState(factura.rubro_id ?? SIN_RUBRO);

  const update = useUpdateFactura();
  const { data: proveedores } = useProveedores();
  const { data: rubros } = useRubrosConAlias();

  useEffect(() => {
    if (!open) return;
    setNumero(factura.numero ?? '');
    setFecha(factura.fecha ?? '');
    setFechaVencimiento(factura.fecha_vencimiento ?? '');
    setTotal(String(factura.total));
    setProveedorId(factura.proveedor_id ?? SIN_PROVEEDOR);
    setRubroId(factura.rubro_id ?? SIN_RUBRO);
  }, [open, factura]);

  const totalNum = Number(total);
  const invalido = !Number.isFinite(totalNum) || totalNum <= 0;

  const submit = () => {
    const input: UpdateFacturaInput = {
      numero: numero.trim() || null,
      fecha: fecha || null,
      fecha_vencimiento: fechaVencimiento || null,
      total: totalNum,
      proveedor_id: proveedorId === SIN_PROVEEDOR ? null : proveedorId,
      rubro_id: rubroId === SIN_RUBRO ? null : rubroId,
    };

    toast.promise(update.mutateAsync({ id: factura.id, input }), {
      loading: 'Guardando cambios…',
      success: () => {
        setOpen(false);
        return 'Factura actualizada.';
      },
      error: (e) => (e as Error).message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <IconTooltip label="Editar factura">
        <DialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={iconButtonClassName}
            aria-label="Editar factura"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      </IconTooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar factura</DialogTitle>
          <DialogDescription>
            Corregí número, fechas, total, proveedor o rubro. Los cambios
            recalculan el saldo y la huella anti-duplicados.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="factura-numero">Número</Label>
            <Input
              id="factura-numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ej. A-00012345"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="factura-fecha">Fecha</Label>
            <Input
              id="factura-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="factura-vencimiento">Vencimiento</Label>
            <Input
              id="factura-vencimiento"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="factura-total">Total</Label>
            <Input
              id="factura-total"
              type="number"
              min="0"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Proveedor</Label>
            <Select value={proveedorId} onValueChange={setProveedorId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_PROVEEDOR}>Sin asignar</SelectItem>
                {(proveedores ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Rubro</Label>
            <Select value={rubroId} onValueChange={setRubroId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sin rubro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_RUBRO}>Sin rubro</SelectItem>
                {(rubros ?? []).map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={update.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={submit} disabled={invalido || update.isPending}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
