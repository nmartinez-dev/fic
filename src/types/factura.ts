import { z } from 'zod';

export type EstadoPago = 'sin_pagar' | 'parcial' | 'saldada';
export type EstadoFactura = 'confirmada' | 'en_revision';
export type OrigenFactura = 'pdf' | 'pdf_escaneado' | 'excel' | 'manual';

export type Factura = {
  id: string;
  proveedor_id: string | null;
  raw_proveedor_nombre: string | null;
  numero: string | null;
  fecha: string | null;
  fecha_vencimiento: string | null;
  total: number;
  moneda: string;
  categoria_id: string | null;
  estado_pago: EstadoPago;
  estado: EstadoFactura;
  origen: OrigenFactura;
  archivo_path: string | null;
  hash_dedup: string | null;
  created_at: string;
  updated_at: string;
};

/** Fila de la vista v_facturas: factura + proveedor + pagado/saldo derivados. */
export type FacturaConSaldo = Factura & {
  proveedor_nombre: string | null;
  pagado: number;
  saldo: number;
};

/** Datos crudos extraidos de un archivo antes de resolver proveedor/dedupe. */
export type FacturaExtraida = {
  proveedorNombre: string | null;
  categoriaNombre: string | null;
  numero: string | null;
  fecha: string | null;
  total: number | null;
  origen: OrigenFactura;
  /** Campos que no se pudieron extraer con confianza. */
  camposFaltantes: string[];
};

export const updateFacturaSchema = z.object({
  numero: z.string().trim().min(1).nullable().optional(),
  fecha: z.string().date().nullable().optional(),
  fecha_vencimiento: z.string().date().nullable().optional(),
  total: z.number().positive().optional(),
  proveedor_id: z.string().uuid().nullable().optional(),
  categoria_id: z.string().uuid().nullable().optional(),
});

export type UpdateFacturaInput = z.infer<typeof updateFacturaSchema>;
