import type { GastoPorCategoria } from '@/types/categoria';

export type DashboardOperativoKpis = {
  revisionPendientes: number;
  facturasEnRevision: number;
  saldoImpago: number;
  facturasConSaldo: number;
  ordenesAbiertas: number;
  avisosPendientes: number;
  preciosFechaLista: string | null;
  preciosCount: number;
  preciosSyncFallo: boolean;
  gastoPorRubro: GastoPorCategoria[];
};

export type DashboardVentasKpis = {
  preciosFechaLista: string | null;
  preciosCount: number;
  categoriasCount: number;
};
