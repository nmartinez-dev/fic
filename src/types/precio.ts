export const AVISO_PRECIO_SYNC_TITULO = 'No se pudieron actualizar los precios';

export type Precio = {
  id: string;
  proveedor_id: string | null;
  codigo_producto: string;
  descripcion: string | null;
  categoria: string | null;
  subcategoria: string | null;
  precio: number;
  stock: number | null;
  fecha_lista: string;
  created_at: string;
};

export type PreciosListado = {
  precios: Precio[];
  fechaLista: string | null;
};

export type SyncPreciosResponse = {
  total: number;
  fecha: string;
};
