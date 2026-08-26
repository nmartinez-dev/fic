'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Settings as SettingsIcon } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();

  const [dias, setDias] = useState('');
  const [diasOrden, setDiasOrden] = useState('');
  const [umbral, setUmbral] = useState('');
  const [cron, setCron] = useState('');

  useEffect(() => {
    if (settings) {
      setDias(String(settings.dias_aviso_vencimiento));
      setDiasOrden(String(settings.dias_aviso_orden_pendiente ?? 14));
      setUmbral(String(settings.umbral_aviso_monto));
      setCron(settings.actualizacion_precios_cron);
    }
  }, [settings]);

  const submit = () => {
    const p = update.mutateAsync({
      dias_aviso_vencimiento: Number(dias) || 0,
      dias_aviso_orden_pendiente: Number(diasOrden) || 0,
      umbral_aviso_monto: Number(umbral) || 0,
      actualizacion_precios_cron: cron.trim(),
    });
    toast.promise(p, {
      loading: 'Guardando…',
      success: 'Ajustes guardados.',
      error: (e) => (e as Error).message,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={SettingsIcon} size="md" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>
          <p className="text-sm text-muted-foreground">
            Parámetros que el admin puede tocar sin depender de nadie.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full max-w-xl" />
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base">Parámetros del sistema</CardTitle>
            <CardDescription>
              Afectan las alertas de vencimiento, órdenes de compra y la
              actualización de precios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="s-dias">Días de aviso antes del vencimiento</Label>
              <Input
                id="s-dias"
                type="number"
                min="0"
                value={dias}
                onChange={(e) => setDias(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Con cuántos días de anticipación se avisa que algo está por
                vencer.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-dias-orden">
                Días para avisar orden pendiente
              </Label>
              <Input
                id="s-dias-orden"
                type="number"
                min="0"
                value={diasOrden}
                onChange={(e) => setDiasOrden(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Si un pedido sigue sin recibirse (pendiente o parcial) después de
                esta cantidad de días desde la fecha del pedido, aparece un aviso
                en la bandeja.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-umbral">Umbral de monto para avisar</Label>
              <Input
                id="s-umbral"
                type="number"
                min="0"
                step="0.01"
                value={umbral}
                onChange={(e) => setUmbral(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Montos por encima de este valor generan un aviso destacado (0 =
                sin umbral).
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-cron">
                Frecuencia de actualización de precios (cron)
              </Label>
              <Input
                id="s-cron"
                value={cron}
                onChange={(e) => setCron(e.target.value)}
                placeholder="0 6 * * *"
              />
              <p className="text-xs text-muted-foreground">
                Referencia de frecuencia deseada. La actualización automática
                corre una vez al día; desde Precios podés forzar una
                actualización manual.
              </p>
            </div>
            <Button onClick={submit} disabled={update.isPending}>
              Guardar ajustes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
