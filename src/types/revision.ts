import type { ProveedorMatch } from '@/types/proveedor';
import type { RubroMatch } from '@/types/rubro';

export type TipoRevision =
  | 'proveedor_ambiguo'
  | 'posible_duplicado'
  | 'dato_incompleto'
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
  raw_rubro?: string;
  rubro_candidatos?: RubroMatch[];
  factura_original?: string;
  motivo?: string;
  camposFaltantes?: string[];
  [key: string]: unknown;
};
