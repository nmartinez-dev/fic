export type Settings = {
  id: number;
  actualizacion_precios_cron: string;
  umbral_aviso_monto: number;
  dias_aviso_vencimiento: number;
  dias_aviso_orden_pendiente: number;
  updated_by: string | null;
  updated_at: string;
};

export type SettingsUpdate = {
  actualizacion_precios_cron: string;
  umbral_aviso_monto: number;
  dias_aviso_vencimiento: number;
  dias_aviso_orden_pendiente: number;
};
