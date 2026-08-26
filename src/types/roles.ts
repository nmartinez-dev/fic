/**
 * RBAC de Cordillera. Reemplaza el "usuario compartido" del sistema viejo:
 * - admin: administrador, ve y hace todo.
 * - compras: Marcela. Proveedores, facturas, ordenes de compra, vencimientos, recibos.
 * - ventas: Julian. Ventas y analitica del negocio.
 *
 * La fuente de verdad de los permisos es la base de datos (policies RLS por rol);
 * esto es el espejo en la app para navegacion y guards de UI/route.
 */
export const ROLES = ['admin', 'compras', 'ventas'] as const;

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
  | 'categorias'
  | 'precios'
  | 'vencimientos'
  | 'revision'
  | 'ventas'
  | 'avisos'
  | 'settings'
  | 'usuarios';

const AREA_ACCESS: Record<Area, Role[]> = {
  dashboard: ['admin', 'compras', 'ventas'],
  proveedores: ['admin', 'compras'],
  facturas: ['admin', 'compras'],
  ordenes: ['admin', 'compras'],
  categorias: ['admin', 'compras'],
  precios: ['admin', 'compras'],
  vencimientos: ['admin', 'compras'],
  revision: ['admin', 'compras'],
  ventas: ['admin', 'ventas'],
  avisos: ['admin', 'compras', 'ventas'],
  settings: ['admin'],
  usuarios: ['admin'],
};

export function canAccess(role: Role, area: Area): boolean {
  return AREA_ACCESS[area].includes(role);
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  compras: 'Compras',
  ventas: 'Ventas',
};
