'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Radio,
  AlertTriangle,
} from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  useVencimientos,
  useVencimientosRealtime,
  useCreateVencimiento,
  useMoverVencimiento,
  useSetEstadoVencimiento,
  useGenerarRecibo,
} from '@/hooks/use-vencimientos';
import { formatCurrency, todayISO, daysBetween } from '@/lib/format';
import type { Vencimiento } from '@/types/vencimiento';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_ALERTA = 7;

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Matriz de 6 semanas (lunes a domingo) que contiene el mes dado. */
function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // lunes = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

type Alerta = 'vencido' | 'sin_recibo' | null;

function alertaDe(v: Vencimiento, hoy: string): Alerta {
  if (v.estado === 'pagado') return null;
  const dias = daysBetween(hoy, v.fecha);
  if (dias < 0) return 'vencido';
  if (dias <= DIAS_ALERTA && v.factura_id && !v.tiene_recibo) return 'sin_recibo';
  return null;
}

export default function VencimientosPage() {
  const hoy = todayISO();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const { data: vencimientos, isLoading } = useVencimientos();
  const live = useVencimientosRealtime();

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor]
  );

  const porDia = useMemo(() => {
    const map = new Map<string, Vencimiento[]>();
    for (const v of vencimientos ?? []) {
      const arr = map.get(v.fecha) ?? [];
      arr.push(v);
      map.set(v.fecha, arr);
    }
    return map;
  }, [vencimientos]);

  const alertas = useMemo(() => {
    let vencidos = 0;
    let sinRecibo = 0;
    for (const v of vencimientos ?? []) {
      const a = alertaDe(v, hoy);
      if (a === 'vencido') vencidos += 1;
      if (a === 'sin_recibo') sinRecibo += 1;
    }
    return { vencidos, sinRecibo };
  }, [vencimientos, hoy]);

  const goPrev = () =>
    setCursor((c) =>
      c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }
    );
  const goNext = () =>
    setCursor((c) =>
      c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeatureIcon icon={CalendarClock} size="md" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Vencimientos</h1>
            <p className="text-sm text-muted-foreground">
              Calendario compartido. Los cambios de otras personas aparecen solos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={live ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}
          >
            <Radio className="mr-1 h-3 w-3" />
            {live ? 'En vivo' : 'Conectando…'}
          </Badge>
          <NuevoVencimientoDialog />
        </div>
      </div>

      {(alertas.vencidos > 0 || alertas.sinRecibo > 0) && (
        <div className="flex flex-wrap gap-3">
          {alertas.vencidos > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-danger" />
              {alertas.vencidos} vencimiento{alertas.vencidos > 1 ? 's' : ''} pasado
              {alertas.vencidos > 1 ? 's' : ''} de fecha sin pagar.
            </div>
          )}
          {alertas.sinRecibo > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning" />
              {alertas.sinRecibo} vence{alertas.sinRecibo > 1 ? 'n' : ''} pronto y todavía
              sin recibo.
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {MESES[cursor.month]} {cursor.year}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor({ year: now.getFullYear(), month: now.getMonth() })}
          >
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="grid grid-cols-7 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
          {DIAS.map((d) => (
            <div key={d} className="px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((day) => {
            const iso = isoOf(day);
            const inMonth = day.getMonth() === cursor.month;
            const items = porDia.get(iso) ?? [];
            const esHoy = iso === hoy;
            return (
              <div
                key={iso}
                className={`min-h-24 border-b border-r p-1.5 last:border-r-0 ${
                  inMonth ? '' : 'bg-muted/30 text-muted-foreground'
                }`}
              >
                <div
                  className={`mb-1 text-right text-xs ${
                    esHoy
                      ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground'
                      : ''
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {items.map((v) => (
                    <VencimientoChip key={v.id} v={v} hoy={hoy} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Cargando calendario…</p>
      )}
    </div>
  );
}

function VencimientoChip({ v, hoy }: { v: Vencimiento; hoy: string }) {
  const alerta = alertaDe(v, hoy);
  const cls =
    v.estado === 'pagado'
      ? 'bg-success/15 text-success'
      : alerta === 'vencido'
        ? 'bg-danger/15 text-danger'
        : alerta === 'sin_recibo'
          ? 'bg-warning/15 text-warning'
          : 'bg-primary/10 text-primary';

  return (
    <VencimientoDialog v={v}>
      <button
        className={`w-full cursor-pointer truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium ${cls}`}
        title={v.titulo}
      >
        {v.monto != null ? formatCurrency(v.monto) : v.titulo}
      </button>
    </VencimientoDialog>
  );
}

function VencimientoDialog({
  v,
  children,
}: {
  v: Vencimiento;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState(v.fecha);
  const mover = useMoverVencimiento();
  const setEstado = useSetEstadoVencimiento();
  const generarRecibo = useGenerarRecibo();

  const run = (p: Promise<unknown>, ok: string) =>
    toast.promise(p, {
      loading: 'Guardando…',
      success: ok,
      error: (e) => (e as Error).message,
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setFecha(v.fecha);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{v.titulo}</DialogTitle>
          <DialogDescription>
            {v.monto != null ? formatCurrency(v.monto) : 'Sin monto'} ·{' '}
            {v.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="venc-fecha">Mover a otra fecha</Label>
            <div className="flex gap-2">
              <Input
                id="venc-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
              <Button
                variant="outline"
                disabled={mover.isPending || fecha === v.fecha}
                onClick={() => run(mover.mutateAsync({ id: v.id, fecha }), 'Vencimiento movido.')}
              >
                Mover
              </Button>
            </div>
          </div>

          {v.factura_id && !v.tiene_recibo && (
            <Button
              variant="outline"
              disabled={generarRecibo.isPending}
              onClick={() =>
                run(generarRecibo.mutateAsync(v.factura_id as string), 'Recibo generado.')
              }
            >
              Generar recibo
            </Button>
          )}
          {v.factura_id && v.tiene_recibo && (
            <p className="text-xs text-muted-foreground">
              Esta factura ya tiene recibo generado.
            </p>
          )}
        </div>

        <DialogFooter>
          {v.estado === 'pendiente' ? (
            <Button
              disabled={setEstado.isPending}
              onClick={() =>
                run(
                  setEstado.mutateAsync({ id: v.id, estado: 'pagado' }),
                  'Marcado como pagado.'
                )
              }
            >
              Marcar como pagado
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={setEstado.isPending}
              onClick={() =>
                run(
                  setEstado.mutateAsync({ id: v.id, estado: 'pendiente' }),
                  'Marcado como pendiente.'
                )
              }
            >
              Marcar como pendiente
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NuevoVencimientoDialog() {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(todayISO());
  const [monto, setMonto] = useState('');
  const crear = useCreateVencimiento();

  const submit = () => {
    const p = crear.mutateAsync({
      titulo: titulo.trim(),
      fecha,
      monto: monto ? Number(monto) : null,
    });
    toast.promise(p, {
      loading: 'Creando…',
      success: () => {
        setOpen(false);
        setTitulo('');
        setMonto('');
        return 'Vencimiento creado.';
      },
      error: (e) => (e as Error).message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo vencimiento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo vencimiento</DialogTitle>
          <DialogDescription>
            Un vencimiento suelto (impuesto, alquiler, servicio) que no viene de
            una factura.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nv-titulo">Título</Label>
            <Input
              id="nv-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: IVA agosto"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nv-fecha">Fecha</Label>
              <Input
                id="nv-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nv-monto">Monto</Label>
              <Input
                id="nv-monto"
                type="number"
                min="0"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={crear.isPending || titulo.trim().length < 2}>
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
