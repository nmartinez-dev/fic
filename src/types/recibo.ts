export type Recibo = {
  id: string;
  factura_id: string;
  numero: string | null;
  fecha_emision: string;
  generado_por: string | null;
  archivo_path: string | null;
  created_at: string;
};
