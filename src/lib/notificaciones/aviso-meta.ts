import type { Area } from '@/types/roles';
import type { Aviso, TipoAviso } from '@/types/aviso';

export const TIPO_LABEL: Record<TipoAviso, string> = {
  vencimiento: 'Vencimiento',
  reclamo: 'Reclamo',
  sistema: 'Sistema',
  orden: 'Orden pendiente',
  venta: 'Venta',
};

export const TIPO_CLS: Record<TipoAviso, string> = {
  vencimiento: 'bg-warning/15 text-warning',
  reclamo: 'bg-danger/15 text-danger',
  sistema: 'bg-muted text-muted-foreground',
  orden: 'bg-warning/15 text-warning',
  venta: 'bg-warning/15 text-warning',
};

/** Área funcional asociada a cada tipo de aviso (para RBAC). */
export function areaForTipoAviso(tipo: TipoAviso): Area {
  switch (tipo) {
    case 'vencimiento':
      return 'vencimientos';
    case 'reclamo':
      return 'proveedores';
    case 'orden':
      return 'ordenes';
    case 'sistema':
      return 'precios';
    case 'venta':
      return 'ventas';
    default: {
      const _exhaustive: never = tipo;
      return _exhaustive;
    }
  }
}

export function hrefForAviso(aviso: Aviso): string {
  switch (aviso.tipo) {
    case 'orden':
      return '/dashboard/ordenes?filtro=pendientes';
    case 'vencimiento':
      return '/dashboard/vencimientos';
    case 'sistema':
      return '/dashboard/precios';
    case 'reclamo':
      return aviso.proveedor_id
        ? `/dashboard/proveedores`
        : '/dashboard/avisos';
    case 'venta':
      return '/dashboard/ventas';
    default: {
      const _exhaustive: never = aviso.tipo;
      return _exhaustive;
    }
  }
}
