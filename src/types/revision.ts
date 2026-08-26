import type { ProveedorMatch } from '@/types/proveedor';
import type { CategoriaMatch } from '@/types/categoria';

export type TipoRevision =
  | 'proveedor_ambiguo'
  | 'posible_duplicado'
  | 'dato_incompleto'
  | 'categoria_ambigua'
  /** @deprecated Usar `categoria_ambigua`. Se elimina al aplicar migración 012. */
  | 'rubro_ambiguo';

export type EstadoRevision = 'pendiente' | 'resuelto' | 'descartado';

export type RevisionItem = {
  id: string;
  tipo: TipoRevision;
  entidad: string;
  entidad_id: string | null;
  titulo: string;
  payload: RevisionPayload;
  estado: EstadoRevision;
  resuelto_por: string | null;
  resuelto_at: string | null;
  resolucion: Record<string, unknown> | null;
  created_at: string;
};

export type RevisionPayload = {
  raw_nombre?: string;
  candidatos?: ProveedorMatch[];
  raw_categoria?: string;
  categoria_candidatos?: CategoriaMatch[];
  /** Compatibilidad con items creados antes del rename. */
  raw_rubro?: string;
  rubro_candidatos?: CategoriaMatch[];
  factura_original?: string;
  motivo?: string;
  camposFaltantes?: string[];
  [key: string]: unknown;
};
