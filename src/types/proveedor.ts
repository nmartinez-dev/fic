export type Proveedor = {
  id: string;
  nombre: string;
  cuit: string | null;
  email: string | null;
  telefono: string | null;
  terminos_pago_dias: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type ProveedorCuentaCorriente = {
  proveedor_id: string;
  nombre: string;
  terminos_pago_dias: number;
  total_comprado: number;
  total_pagado: number;
  saldo: number;
};

/** Candidato devuelto por la funcion match_proveedor (pg_trgm). */
export type ProveedorMatch = {
  proveedor_id: string;
  nombre: string;
  score: number;
  via: 'nombre' | 'alias';
};
