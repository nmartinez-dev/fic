import type { FacturaExtraida, OrigenFactura } from '@/types/factura';

/**
 * Convierte montos en formato es-AR (1.234.567,89) o Excel/internacional (33333.33).
 * Excel suele exportar con punto decimal; las facturas argentinas usan coma decimal.
 */
export function parseMontoAr(raw: string): number | null {
  const clean = raw.replace(/[^\d.,]/g, '').trim();
  if (!clean) return null;

  const hasComma = clean.includes(',');
  const hasDot = clean.includes('.');

  let normalized: string;

  if (hasComma && hasDot) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      normalized = clean.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = clean.replace(/,/g, '');
    }
  } else if (hasComma) {
    normalized = clean.replace(/\./g, '').replace(',', '.');
  } else if (hasDot) {
    const parts = clean.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      normalized = clean;
    } else {
      normalized = clean.replace(/\./g, '');
    }
  } else {
    normalized = clean;
  }

  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toISO(d: string, m: string, y: string): string | null {
  const year = y.length === 2 ? `20${y}` : y;
  const iso = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  return Number.isNaN(new Date(`${iso}T00:00:00`).getTime()) ? null : iso;
}

/** Busca un valor en lineas tipo "Proveedor: X" o "Proveedor \\t X" (Excel). */
function extractKeyValue(text: string, labels: string[]): string | null {
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const inline = trimmed.match(new RegExp(`^${escaped}\\s*[:\\-]?\\s*(.+)$`, 'i'));
      if (inline?.[1]?.trim()) return inline[1].trim();
    }

    const parts = trimmed.split(/\t+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const key = parts[0].replace(/:$/, '').trim().toLowerCase();
      if (labels.some((l) => key === l.toLowerCase() || key.startsWith(l.toLowerCase()))) {
        return parts.slice(1).join(' ').trim();
      }
    }
  }
  return null;
}

function extractTotal(text: string): number | null {
  const fromLabel = extractKeyValue(text, ['total', 'importe', 'importe total']);
  if (fromLabel) {
    const v = parseMontoAr(fromLabel);
    if (v !== null) return v;
  }

  const re = /(?:total|importe)\b[^\d$-]{0,15}\$?\s*([\d.,]+)/gi;
  let best: number | null = null;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const value = parseMontoAr(match[1]);
    if (value !== null && (best === null || value > best)) best = value;
  }
  return best;
}

function extractNumero(text: string): string | null {
  const fromLabel = extractKeyValue(text, [
    'factura n°',
    'factura nº',
    'factura no',
    'factura',
    'comprobante',
    'nro factura',
    'numero',
  ]);
  if (fromLabel) {
    const code = fromLabel.match(/[A-Z0-9][A-Z0-9\-/.]*/i);
    if (code) return code[0].trim();
  }

  const re =
    /(?:factura|comprobante|fact\.?|remito)\s*(?:n[°º]?\.?|nro\.?|#)?\s*[:.]?\s*([A-Z0-9][A-Z0-9\-/.]{1,20})/i;
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function extractFecha(text: string): string | null {
  const fromLabel = extractKeyValue(text, ['fecha', 'fecha emision', 'fecha de emision']);
  const source = fromLabel ?? text;
  const m = source.match(/(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})/);
  return m ? toISO(m[1], m[2], m[3]) : null;
}

const NOMBRE_STOPWORDS =
  /^(factura|comprobante|remito|presupuesto|cuit|iva|fecha|total|importe)\b/i;

function extractProveedorNombre(text: string): string | null {
  const fromLabel = extractKeyValue(text, [
    'proveedor',
    'razon social',
    'razón social',
    'emisor',
    'vendedor',
  ]);
  if (fromLabel && fromLabel.length >= 2) return fromLabel.slice(0, 80);

  const lines = text.split('\n').map((l) => l.trim());
  for (const line of lines) {
    const hasLetters = /[a-záéíóúñ]/i.test(line);
    if (hasLetters && line.length >= 4 && !NOMBRE_STOPWORDS.test(line)) {
      const cleaned = line.replace(/^proveedor\s*:\s*/i, '').trim();
      if (cleaned.length >= 2) return cleaned.slice(0, 80);
    }
  }
  return null;
}

/** Limpia prefijos que vienen en Excel desprolijo antes de matchear proveedor. */
export function normalizeProveedorNombre(raw: string): string {
  return raw
    .replace(/^proveedor\s*:\s*/i, '')
    .replace(/\t+/g, ' ')
    .trim();
}

function extractCategoriaNombre(text: string): string | null {
  const fromLabel = extractKeyValue(text, [
    'categoría',
    'categoria',
    'rubro',
    'tipo',
    'línea',
    'linea',
    'familia',
  ]);
  if (fromLabel && fromLabel.length >= 2) return fromLabel.slice(0, 80);
  return null;
}

/** Limpia prefijos antes de matchear categoría. */
export function normalizeCategoriaNombre(raw: string): string {
  return raw
    .replace(/^(categor[ií]a|rubro|tipo|l[ií]nea)\s*:\s*/i, '')
    .replace(/\t+/g, ' ')
    .trim();
}

/** Extraccion heuristica. Best-effort: lo dudoso va a Revision. */
export function extractFromText(
  text: string,
  origen: OrigenFactura
): FacturaExtraida {
  const proveedorNombre = extractProveedorNombre(text);
  const categoriaNombre = extractCategoriaNombre(text);
  const numero = extractNumero(text);
  const fecha = extractFecha(text);
  const total = extractTotal(text);

  const camposFaltantes: string[] = [];
  if (!proveedorNombre) camposFaltantes.push('proveedor');
  if (!numero) camposFaltantes.push('numero');
  if (!fecha) camposFaltantes.push('fecha');
  if (total === null) camposFaltantes.push('total');

  return {
    proveedorNombre,
    categoriaNombre,
    numero,
    fecha,
    total,
    origen,
    camposFaltantes,
  };
}
