import { z } from 'zod';

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

export const updateOrdenSchema = z.object({
  proveedor_id: z.string().uuid().nullable().optional(),
  numero: z.string().trim().nullable().optional(),
  fecha: z.string().date().optional(),
  total: z.number().min(0).optional(),
  descripcion: z.string().trim().nullable().optional(),
  notas: z.string().trim().nullable().optional(),
});

export type UpdateOrdenInput = z.infer<typeof updateOrdenSchema>;

export type FiltroEstadoOrden = 'todas' | EstadoOrden | 'pendientes';

export const ESTADOS_ABIERTOS: EstadoOrden[] = ['pendiente', 'parcial'];
