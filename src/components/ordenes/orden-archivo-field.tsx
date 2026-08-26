'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type OrdenArchivoFieldProps = {
  id: string;
  tieneArchivo?: boolean;
  onFileChange: (file: File | null) => void;
};

export function OrdenArchivoField({
  id,
  tieneArchivo,
  onFileChange,
}: OrdenArchivoFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Documento adjunto</Label>
      <Input
        id={id}
        type="file"
        accept=".pdf,.xlsx,.xls,image/*"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      <p className="text-xs text-muted-foreground">
        {tieneArchivo
          ? 'PDF, Excel o imagen. Elegí un archivo para reemplazar el adjunto actual.'
          : 'Opcional: PDF, Excel o imagen del pedido.'}
      </p>
    </div>
  );
}
