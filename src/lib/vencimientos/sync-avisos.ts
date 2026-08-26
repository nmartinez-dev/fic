import type { SupabaseClient } from '@supabase/supabase-js';
import { daysBetween, todayISO } from '@/lib/format';
import type { Vencimiento } from '@/types/vencimiento';

type AvisoVencimiento = {
  needs: boolean;
  titulo: string;
  cuerpo: string;
};

function avisoParaVencimiento(
  v: Vencimiento,
  hoy: string,
  umbral: number
): AvisoVencimiento {
  if (v.estado === 'pagado') {
    return { needs: false, titulo: '', cuerpo: '' };
  }

  const dias = daysBetween(hoy, v.fecha);

  if (dias < 0) {
    const diasVencido = Math.abs(dias);
    return {
      needs: true,
      titulo: `Vencido: ${v.titulo}`,
      cuerpo: `Venció hace ${diasVencido} ${diasVencido === 1 ? 'día' : 'días'}.${v.monto != null ? ` Monto: $${v.monto.toLocaleString('es-AR')}.` : ''}`,
    };
  }

  if (dias <= umbral) {
    return {
      needs: true,
      titulo: `Vence pronto: ${v.titulo}`,
      cuerpo:
        dias === 0
          ? 'Vence hoy.'
          : `Vence en ${dias} ${dias === 1 ? 'día' : 'días'}.`,
    };
  }

  if (dias <= 7 && v.factura_id && !v.tiene_recibo) {
    return {
      needs: true,
      titulo: `Sin recibo: ${v.titulo}`,
      cuerpo: `Vence en ${dias} ${dias === 1 ? 'día' : 'días'} y todavía no tiene recibo generado.`,
    };
  }

  return { needs: false, titulo: '', cuerpo: '' };
}

/**
 * Crea avisos para vencimientos que requieren atención y resuelve los obsoletos.
 */
export async function syncAvisosVencimientos(
  db: SupabaseClient
): Promise<{ creados: number; resueltos: number }> {
  const { data: settings, error: settingsErr } = await db
    .from('settings')
    .select('dias_aviso_vencimiento')
    .eq('id', 1)
    .single();

  if (settingsErr) throw new Error(settingsErr.message);

  const umbral = (settings?.dias_aviso_vencimiento as number | undefined) ?? 3;
  const hoy = todayISO();

  const { data: vencimientos, error: vencErr } = await db
    .from('v_vencimientos')
    .select('*')
    .eq('estado', 'pendiente');

  if (vencErr) throw new Error(vencErr.message);

  const alertas = new Map<string, AvisoVencimiento>();

  for (const raw of vencimientos ?? []) {
    const v = raw as unknown as Vencimiento;
    const aviso = avisoParaVencimiento(v, hoy, umbral);
    if (aviso.needs) {
      alertas.set(v.id, aviso);
    }
  }

  let creados = 0;

  for (const [vencimientoId, aviso] of alertas) {
    const { error: insertErr } = await db.from('avisos').insert({
      tipo: 'vencimiento',
      titulo: aviso.titulo,
      cuerpo: aviso.cuerpo,
      fecha: hoy,
      estado: 'pendiente',
      vencimiento_id: vencimientoId,
    });

    if (!insertErr) {
      creados += 1;
    }
  }

  const { data: avisosPendientes, error: avisosErr } = await db
    .from('avisos')
    .select('id, vencimiento_id')
    .eq('tipo', 'vencimiento')
    .eq('estado', 'pendiente')
    .not('vencimiento_id', 'is', null);

  if (avisosErr) throw new Error(avisosErr.message);

  let resueltos = 0;

  for (const aviso of avisosPendientes ?? []) {
    const vencimientoId = aviso.vencimiento_id as string;
    if (alertas.has(vencimientoId)) continue;

    const { error: resolveErr } = await db
      .from('avisos')
      .update({
        estado: 'resuelto',
        resuelto_at: new Date().toISOString(),
      })
      .eq('id', aviso.id);

    if (!resolveErr) resueltos += 1;
  }

  return { creados, resueltos };
}
