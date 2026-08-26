import { TrendingUp } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

export default function VentasPage() {
  return (
    <PlaceholderPage
      icon={TrendingUp}
      title="Ventas"
      description="Cómo venís mes a mes: facturación, evolución de precios y stock. Las ventas duplicadas o con datos rotos se avisan aparte, no se suman como válidas. En construcción."
    />
  );
}
