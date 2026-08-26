/**
 * RBAC de Cordillera. Reemplaza el "usuario compartido" del sistema viejo:
 * - owner: el dueño, ve y hace todo.
 * - compras: Marcela. Proveedores, facturas, ordenes de compra, vencimientos, recibos.
 * - ventas: Julian. Ventas y analitica del negocio.
 *
 * La fuente de verdad de los permisos es la base de datos (policies RLS por rol);
 * esto es el espejo en la app para navegacion y guards de UI/route.
 */
export const ROLES = ['owner', 'compras', 'ventas'] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/** Areas funcionales de la app, para gating de navegacion y rutas. */
export type Area =
  | 'dashboard'
  | 'proveedores'
  | 'facturas'
  | 'ordenes'
  | 'rubros'
  | 'vencimientos'
  | 'revision'
  | 'ventas'
  | 'avisos'
  | 'settings';

const AREA_ACCESS: Record<Area, Role[]> = {
  dashboard: ['owner', 'compras', 'ventas'],
  proveedores: ['owner', 'compras'],
  facturas: ['owner', 'compras'],
  ordenes: ['owner', 'compras'],
  rubros: ['owner', 'compras'],
  vencimientos: ['owner', 'compras'],
  revision: ['owner', 'compras'],
  ventas: ['owner', 'ventas'],
  avisos: ['owner', 'compras'],
  settings: ['owner'],
};

export function canAccess(role: Role, area: Area): boolean {
  return AREA_ACCESS[area].includes(role);
}

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Dueño',
  compras: 'Compras',
  ventas: 'Ventas',
};
