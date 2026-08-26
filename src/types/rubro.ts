export type RubroMatch = {
  rubro_id: string;
  nombre: string;
  score: number;
  via: 'nombre' | 'alias';
};

export type RubroAlias = {
  id: string;
  rubro_id: string;
  alias: string;
  created_at: string;
};

export type RubroConAlias = {
  id: string;
  nombre: string;
  created_at: string;
  rubro_alias: RubroAlias[];
  /** Referencias para decidir si se puede eliminar sin fusionar. */
  facturas_count?: number;
  ventas_count?: number;
};

export type GastoPorRubro = {
  rubro_id: string | null;
  rubro: string;
  facturas: number;
  total: number;
};
