import { createClient } from '@/lib/supabase/client';
import { listGastoPorCategoria } from '@/services/categoria-service';
import { listPrecios } from '@/services/precio-service';
import { AVISO_PRECIO_SYNC_TITULO } from '@/types/precio';
import type {
  DashboardOperativoKpis,
  DashboardVentasKpis,
} from '@/types/dashboard';

export async function fetchDashboardOperativo(): Promise<DashboardOperativoKpis> {
  const supabase = createClient();

  const [
    revisionRes,
    facturasRevisionRes,
    facturasSaldoRes,
    ordenesRes,
    avisosRes,
    preciosData,
    avisoPreciosRes,
    gastoPorRubro,
  ] = await Promise.all([
    supabase
      .from('revision_queue')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente'),
    supabase
      .from('facturas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'en_revision'),
    supabase
      .from('v_facturas')
      .select('saldo')
      .eq('estado', 'confirmada')
      .gt('saldo', 0),
    supabase
      .from('ordenes_compra')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['pendiente', 'parcial']),
    supabase
      .from('avisos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente'),
    listPrecios(),
    supabase
      .from('avisos')
      .select('id')
      .eq('estado', 'pendiente')
      .eq('titulo', AVISO_PRECIO_SYNC_TITULO)
      .limit(1),
    listGastoPorCategoria(),
  ]);

  if (revisionRes.error) throw new Error(revisionRes.error.message);
  if (facturasRevisionRes.error) throw new Error(facturasRevisionRes.error.message);
  if (facturasSaldoRes.error) throw new Error(facturasSaldoRes.error.message);
  if (ordenesRes.error) throw new Error(ordenesRes.error.message);
  if (avisosRes.error) throw new Error(avisosRes.error.message);
  if (avisoPreciosRes.error) throw new Error(avisoPreciosRes.error.message);

  const saldos = facturasSaldoRes.data ?? [];
  const saldoImpago = saldos.reduce(
    (acc, row) => acc + Number(row.saldo ?? 0),
    0
  );

  return {
    revisionPendientes: revisionRes.count ?? 0,
    facturasEnRevision: facturasRevisionRes.count ?? 0,
    saldoImpago,
    facturasConSaldo: saldos.length,
    ordenesAbiertas: ordenesRes.count ?? 0,
    avisosPendientes: avisosRes.count ?? 0,
    preciosFechaLista: preciosData.fechaLista,
    preciosCount: preciosData.precios.length,
    preciosSyncFallo: (avisoPreciosRes.data?.length ?? 0) > 0,
    gastoPorRubro,
  };
}

export async function fetchDashboardVentas(): Promise<DashboardVentasKpis> {
  const supabase = createClient();

  const [preciosData, categoriasRes] = await Promise.all([
    listPrecios(),
    supabase.from('rubros').select('*', { count: 'exact', head: true }),
  ]);

  if (categoriasRes.error) throw new Error(categoriasRes.error.message);

  return {
    preciosFechaLista: preciosData.fechaLista,
    preciosCount: preciosData.precios.length,
    categoriasCount: categoriasRes.count ?? 0,
  };
}
