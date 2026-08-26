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
  rubro_id: string | null;
  estado_pago: EstadoPago;
  estado: EstadoFactura;
  origen: OrigenFactura;
  archivo_path: string | null;
  hash_dedup: string | null;
  created_at: string;
  updated_at: string;
};

export type FacturaConProveedor = Factura & {
  proveedor: { id: string; nombre: string } | null;
};

/** Datos crudos extraidos de un archivo antes de resolver proveedor/dedupe. */
export type FacturaExtraida = {
  proveedorNombre: string | null;
  numero: string | null;
  fecha: string | null;
  total: number | null;
  origen: OrigenFactura;
  /** Campos que no se pudieron extraer con confianza. */
  camposFaltantes: string[];
};
