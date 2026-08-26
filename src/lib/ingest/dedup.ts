/** Normaliza un nombre de proveedor para comparar/deduplicar. */
export function normalizeNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // acentos
    .replace(/\b(s\.?a\.?|s\.?r\.?l\.?|s\.?a\.?s\.?)\b/g, '') // sufijos legales
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Huella para detectar la misma factura cargada dos veces:
 * proveedor (normalizado) + numero + total.
 */
export function buildHashDedup(
  proveedorNombre: string | null,
  numero: string | null,
  total: number | null
): string | null {
  if (!numero || total === null) return null;
  const prov = proveedorNombre ? normalizeNombre(proveedorNombre) : 'sin-prov';
  return `${prov}|${numero.toLowerCase().replace(/\s/g, '')}|${total}`;
}
