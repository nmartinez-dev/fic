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
};

export type GastoPorRubro = {
  rubro_id: string | null;
  rubro: string;
  facturas: number;
  total: number;
};
