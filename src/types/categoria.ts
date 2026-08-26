export type CategoriaMatch = {
  categoria_id: string;
  nombre: string;
  score: number;
  via: 'nombre' | 'alias';
};

export type CategoriaAlias = {
  id: string;
  categoria_id: string;
  alias: string;
  created_at: string;
};

export type CategoriaConAlias = {
  id: string;
  nombre: string;
  created_at: string;
  categoria_alias: CategoriaAlias[];
  /** Referencias para decidir si se puede eliminar sin fusionar. */
  facturas_count?: number;
  ventas_count?: number;
};

export type GastoPorCategoria = {
  categoria_id: string | null;
  categoria: string;
  facturas: number;
  total: number;
};
