export type EstadoVencimiento = 'pendiente' | 'pagado';

export type Vencimiento = {
  id: string;
  factura_id: string | null;
  proveedor_id: string | null;
  titulo: string;
  fecha: string;
  monto: number | null;
  estado: EstadoVencimiento;
  created_at: string;
  updated_at: string;
  tiene_recibo: boolean;
};

export type NuevoVencimiento = {
  titulo: string;
  fecha: string;
  monto: number | null;
  proveedor_id?: string | null;
  factura_id?: string | null;
};
