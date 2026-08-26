export type EstadoDato = 'valida' | 'duplicada' | 'rota';

export type Venta = {
  id: string;
  codigo: string | null;
  fecha: string | null;
  producto: string | null;
  rubro_id: string | null;
  cantidad: number | null;
  precio_unitario: number | null;
  total: number | null;
  estado_dato: EstadoDato;
  motivo_flag: string | null;
  created_at: string;
};
