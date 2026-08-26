import { describe, expect, it } from 'vitest';
import { parsePrecioPortal } from '@/lib/precios/portal';

describe('parsePrecioPortal', () => {
  it('parsea precio con simbolo y miles AR', () => {
    expect(parsePrecioPortal('$48.210')).toBe(48210);
  });

  it('parsea precio con decimales', () => {
    expect(parsePrecioPortal('$1.234,56')).toBe(1234.56);
  });

  it('devuelve 0 para vacio', () => {
    expect(parsePrecioPortal('')).toBe(0);
  });
});
