export type EstadoOrden = 'pendiente' | 'parcial' | 'recibida' | 'cancelada';

export type OrdenCompra = {
  id: string;
  proveedor_id: string | null;
  numero: string | null;
  fecha: string;
  total: number;
  estado: EstadoOrden;
  descripcion: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type OrdenCompraConProveedor = OrdenCompra & {
  proveedor: { id: string; nombre: string } | null;
};

export type NuevaOrden = {
  proveedor_id: string | null;
  numero: string | null;
  fecha: string;
  total: number;
  descripcion: string | null;
};
