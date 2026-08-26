'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';
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
import { useCreatePago } from '@/hooks/use-pagos';
import { formatCurrency, todayISO } from '@/lib/format';
import type { FacturaConSaldo } from '@/types/factura';

const MEDIOS = ['transferencia', 'efectivo', 'cheque', 'otro'] as const;

type RegistrarPagoDialogProps = {
  factura: FacturaConSaldo;
  disabled?: boolean;
  tooltip?: string;
};

export function RegistrarPagoDialog({
  factura,
  disabled = false,
  tooltip = 'Registrar pago',
}: RegistrarPagoDialogProps) {
  const [open, setOpen] = useState(false);
  const [monto, setMonto] = useState(String(factura.saldo));
  const [fecha, setFecha] = useState(todayISO());
  const [medio, setMedio] = useState<string>('transferencia');
  const crear = useCreatePago();

  const montoNum = Number(monto);
  const invalido = !Number.isFinite(montoNum) || montoNum <= 0;

  const onOpenChange = (v: boolean) => {
    if (disabled && v) return;
    setOpen(v);
    if (v) setMonto(String(factura.saldo));
  };

  const submit = () => {
    const p = crear.mutateAsync({
      factura_id: factura.id,
      proveedor_id: factura.proveedor_id,
      fecha,
      monto: montoNum,
      medio,
    });
    toast.promise(p, {
      loading: 'Registrando pago...',
      success: () => {
        setOpen(false);
        return 'Pago registrado.';
      },
      error: (e) => (e as Error).message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <IconTooltip label={tooltip}>
        <DialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={iconButtonClassName}
            aria-label={tooltip}
            disabled={disabled}
          >
            <Wallet className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      </IconTooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>
            {factura.numero ?? 'Factura'} ·{' '}
            {factura.proveedor_nombre ?? 'Sin proveedor'}. Saldo pendiente:{' '}
            <span className="font-medium text-foreground">
              {formatCurrency(factura.saldo)}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pago-monto">Monto</Label>
            <Input
              id="pago-monto"
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
            {montoNum > factura.saldo && (
              <p className="text-xs text-warning">
                El monto supera el saldo: la factura quedará saldada.
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pago-fecha">Fecha</Label>
            <Input
              id="pago-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Medio</Label>
            <Select value={medio} onValueChange={setMedio}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDIOS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
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
            disabled={crear.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={submit} disabled={invalido || crear.isPending}>
            Registrar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
