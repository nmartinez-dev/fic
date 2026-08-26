/**
 * Claves centralizadas de React Query. Permite invalidar por prefijo
 * (ej: ['proveedores'] invalida todo lo de proveedores).
 */
export const queryKeys = {
  proveedores: ['proveedores'] as const,
  proveedor: (id: string) => ['proveedores', id] as const,
  proveedorCuentaCorriente: (id: string) =>
    ['proveedores', id, 'cuenta-corriente'] as const,

  facturas: (filters?: Record<string, unknown>) =>
    ['facturas', 'list', filters ?? {}] as const,
  facturasAll: ['facturas'] as const,
  factura: (id: string) => ['facturas', id] as const,

  revisionQueue: ['revision'] as const,
  revisionPendientes: ['revision', 'pendientes'] as const,

  ordenesCompra: (estado?: string) => ['ordenes', estado ?? 'todas'] as const,
  ordenesCompraAll: ['ordenes'] as const,

  categorias: ['categorias'] as const,
  gastoPorCategoria: (desde: string, hasta: string) =>
    ['categorias', 'gasto', desde, hasta] as const,

  vencimientos: (desde: string, hasta: string) =>
    ['vencimientos', desde, hasta] as const,
  vencimientosAll: ['vencimientos'] as const,

  avisos: ['avisos'] as const,
  avisosPendientes: ['avisos', 'pendientes'] as const,

  ventasResumen: (desde: string, hasta: string) =>
    ['ventas', 'resumen', desde, hasta] as const,
  ventasCalidad: ['ventas', 'calidad'] as const,
  ventasAll: ['ventas'] as const,

  precios: ['precios'] as const,

  settings: ['settings'] as const,
  usersAdmin: ['admin', 'users'] as const,
  dashboard: ['dashboard'] as const,
};
