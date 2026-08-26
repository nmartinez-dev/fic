import { extractText, getDocumentProxy } from 'unpdf';
import * as XLSX from 'xlsx';

export type ParsedContent = {
  /** Texto plano para el extractor heuristico. */
  text: string;
  origen: 'pdf' | 'pdf_escaneado' | 'excel';
  /** True si el PDF no tenia texto (probable escaneo/foto) y hace falta OCR. */
  necesitaOcr: boolean;
};

const MIN_PDF_TEXT = 20;

export async function parsePdf(buffer: ArrayBuffer): Promise<ParsedContent> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const clean = (text ?? '').trim();
  const necesitaOcr = clean.length < MIN_PDF_TEXT;
  return {
    text: clean,
    origen: necesitaOcr ? 'pdf_escaneado' : 'pdf',
    necesitaOcr,
  };
}

export function parseXlsx(buffer: ArrayBuffer): ParsedContent {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
  });
  // Aplanamos a texto: tolera fila de titulos movida y filas vacias en el medio,
  // porque el extractor busca por palabras clave, no por posicion fija.
  const text = rows
    .map((row) => (Array.isArray(row) ? row.join(' \t ') : String(row)))
    .filter((line) => line.trim().length > 0)
    .join('\n');
  return { text, origen: 'excel', necesitaOcr: false };
}

export function detectKind(
  mime: string,
  filename: string
): 'pdf' | 'xlsx' | 'image' | 'unknown' {
  const lower = filename.toLowerCase();
  if (mime === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (
    mime.includes('spreadsheet') ||
    mime === 'application/vnd.ms-excel' ||
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xls')
  ) {
    return 'xlsx';
  }
  if (mime.startsWith('image/')) return 'image';
  return 'unknown';
}
