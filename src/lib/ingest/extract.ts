import 'server-only';
import type { FacturaExtraida, OrigenFactura } from '@/types/factura';

/** Convierte un numero en formato es-AR (1.234.567,89) a Number. */
export function parseMontoAr(raw: string): number | null {
  const clean = raw.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(clean);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toISO(d: string, m: string, y: string): string | null {
  const year = y.length === 2 ? `20${y}` : y;
  const iso = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  return Number.isNaN(new Date(`${iso}T00:00:00`).getTime()) ? null : iso;
}

function extractTotal(text: string): number | null {
  const re = /(?:total|importe)\b[^\d$-]{0,15}\$?\s*([\d.,]+)/gi;
  let best: number | null = null;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const value = parseMontoAr(match[1]);
    // Nos quedamos con el mayor "total" encontrado (suele ser el total final).
    if (value !== null && (best === null || value > best)) best = value;
  }
  return best;
}

function extractNumero(text: string): string | null {
  const re =
    /(?:factura|comprobante|fact\.?|remito)\s*(?:n[°º]?\.?|nro\.?|#)?\s*[:]?\s*([A-Z]?-?\d{1,5}-?\d{0,8})/i;
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function extractFecha(text: string): string | null {
  const m = text.match(/(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})/);
  return m ? toISO(m[1], m[2], m[3]) : null;
}

const NOMBRE_STOPWORDS = /factura|comprobante|remito|presupuesto|cuit|iva|fecha|total/i;

function extractProveedorNombre(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim());
  for (const line of lines) {
    const hasLetters = /[a-záéíóúñ]/i.test(line);
    if (hasLetters && line.length >= 4 && !NOMBRE_STOPWORDS.test(line)) {
      // Recorta a algo razonable (evita traer un parrafo entero).
      return line.slice(0, 80);
    }
  }
  return null;
}

/** Extraccion heuristica por regex. Best-effort: lo dudoso va a Revision. */
export function extractFromText(
  text: string,
  origen: OrigenFactura
): FacturaExtraida {
  const proveedorNombre = extractProveedorNombre(text);
  const numero = extractNumero(text);
  const fecha = extractFecha(text);
  const total = extractTotal(text);

  const camposFaltantes: string[] = [];
  if (!proveedorNombre) camposFaltantes.push('proveedor');
  if (!numero) camposFaltantes.push('numero');
  if (!fecha) camposFaltantes.push('fecha');
  if (total === null) camposFaltantes.push('total');

  return { proveedorNombre, numero, fecha, total, origen, camposFaltantes };
}
