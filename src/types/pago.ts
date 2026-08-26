export type Pago = {
  id: string;
  factura_id: string;
  proveedor_id: string | null;
  fecha: string;
  monto: number;
  medio: string | null;
  notas: string | null;
  created_by: string | null;
  created_at: string;
};

export type NuevoPago = {
  factura_id: string;
  proveedor_id: string | null;
  fecha: string;
  monto: number;
  medio: string | null;
  notas?: string | null;
};
