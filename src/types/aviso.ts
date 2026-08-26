export type TipoAviso = 'vencimiento' | 'reclamo' | 'sistema';
export type EstadoAviso = 'pendiente' | 'resuelto';

export type Aviso = {
  id: string;
  tipo: TipoAviso;
  titulo: string;
  cuerpo: string | null;
  proveedor_id: string | null;
  fecha: string;
  estado: EstadoAviso;
  resuelto_por: string | null;
  resuelto_at: string | null;
  created_at: string;
};
