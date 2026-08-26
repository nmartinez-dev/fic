import { describe, expect, it } from 'vitest';
import { parseMontoAr, extractFromText } from './extract';

describe('parseMontoAr', () => {
  it('parsea formato argentino con miles y coma decimal', () => {
    expect(parseMontoAr('1.234.567,89')).toBe(1234567.89);
  });

  it('parsea formato Excel con punto decimal', () => {
    expect(parseMontoAr('33333.33')).toBe(33333.33);
  });

  it('parsea total con simbolo de moneda', () => {
    expect(parseMontoAr('$ 82.000,00')).toBe(82000);
  });
});

describe('extractFromText', () => {
  const excelText = [
    'Proveedor: \t Pintureria Central',
    'Factura N°: \t PC-777',
    'Fecha: \t 20/08/2026',
    'Total: \t 33333.33',
  ].join('\n');

  it('extrae campos de un Excel desprolijo', () => {
    const r = extractFromText(excelText, 'excel');
    expect(r.proveedorNombre).toBe('Pintureria Central');
    expect(r.numero).toBe('PC-777');
    expect(r.fecha).toBe('2026-08-20');
    expect(r.total).toBe(33333.33);
    expect(r.camposFaltantes).toEqual([]);
  });
});
