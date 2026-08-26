import { roundMoney } from '@/lib/money';

export type PortalPrecioRow = {
  codigo_producto: string;
  descripcion: string;
  categoria: string | null;
  subcategoria: string | null;
  precio: number;
  stock: number | null;
};

type PortalProducto = {
  id?: string;
  codigo?: string;
  descripcion?: string;
  categoria?: string;
  subcategoria?: string;
  precio?: string;
  stock?: string;
};

type PortalPreciosResponse = {
  productos?: PortalProducto[];
};

function getPortalConfig(): { url: string; user: string; password: string } {
  const url = process.env.PORTAL_URL?.replace(/\/$/, '');
  const user = process.env.PORTAL_USER;
  const password = process.env.PORTAL_PASSWORD;

  if (!url || !user || !password) {
    throw new Error(
      'Faltan PORTAL_URL, PORTAL_USER o PORTAL_PASSWORD en las variables de entorno.'
    );
  }

  return { url, user, password };
}

/** Convierte "$48.210" o "48.210,50" a número. */
export function parsePrecioPortal(value: string): number {
  const cleaned = value
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .trim();
  if (!cleaned) return 0;

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  let normalized = cleaned;
  if (hasComma && hasDot) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = cleaned.replace(',', '.');
  } else if (hasDot) {
    const parts = cleaned.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      normalized = cleaned.replace(/\./g, '');
    }
  }

  const n = Number.parseFloat(normalized);
  return roundMoney(Number.isFinite(n) ? n : 0);
}

function extractSessionCookie(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const match = setCookie.match(/portal_session=([^;]+)/);
  return match ? `portal_session=${match[1]}` : null;
}

function mapProducto(p: PortalProducto): PortalPrecioRow | null {
  const codigo = p.codigo?.trim();
  if (!codigo) return null;

  const stockRaw = p.stock?.trim();
  const stock =
    stockRaw && /^\d+$/.test(stockRaw) ? Number.parseInt(stockRaw, 10) : null;

  return {
    codigo_producto: codigo,
    descripcion: p.descripcion?.trim() ?? codigo,
    categoria: p.categoria?.trim() || null,
    subcategoria: p.subcategoria?.trim() || null,
    precio: parsePrecioPortal(p.precio ?? '0'),
    stock,
  };
}

/**
 * Login en el portal del proveedor y descarga la lista de precios (JSON).
 */
export async function fetchPreciosFromPortal(): Promise<PortalPrecioRow[]> {
  const { url, user, password } = getPortalConfig();

  const loginRes = await fetch(`${url}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ usuario: user, clave: password }),
    redirect: 'manual',
  });

  if (loginRes.status !== 303 && loginRes.status !== 200 && loginRes.status !== 302) {
    throw new Error(
      `Login al portal falló (HTTP ${loginRes.status}). Revisá usuario y clave.`
    );
  }

  const cookie = extractSessionCookie(loginRes.headers.get('set-cookie'));
  if (!cookie) {
    throw new Error('El portal no devolvió sesión tras el login.');
  }

  const preciosRes = await fetch(`${url}/api/precios`, {
    headers: { Cookie: cookie },
  });

  if (!preciosRes.ok) {
    throw new Error(
      `No se pudo descargar la lista de precios (HTTP ${preciosRes.status}).`
    );
  }

  const json = (await preciosRes.json()) as PortalPreciosResponse;
  const rows = (json.productos ?? [])
    .map(mapProducto)
    .filter((r): r is PortalPrecioRow => r !== null);

  if (rows.length === 0) {
    throw new Error('El portal devolvió una lista de precios vacía.');
  }

  return rows;
}
