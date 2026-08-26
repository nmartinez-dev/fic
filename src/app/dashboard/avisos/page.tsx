import { Bell } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

export default function AvisosPage() {
  return (
    <PlaceholderPage
      icon={Bell}
      title="Avisos"
      description="La bandeja de mensajes del sistema (vencimientos por vencer, reclamos de proveedores) traída acá, marcando cuáles quedaron sin resolver. En construcción."
    />
  );
}
