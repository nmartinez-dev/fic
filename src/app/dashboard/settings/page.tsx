import { Settings } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

export default function SettingsPage() {
  return (
    <PlaceholderPage
      icon={Settings}
      title="Ajustes"
      description="Parámetros que el dueño puede tocar sin depender de nadie: cada cuánto se actualizan los precios, a partir de qué monto avisar, y los accesos del equipo. En construcción."
    />
  );
}
