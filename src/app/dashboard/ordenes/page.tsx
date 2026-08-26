import { ClipboardList } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

export default function OrdenesPage() {
  return (
    <PlaceholderPage
      icon={ClipboardList}
      title="Órdenes de compra"
      description="Seguí cada pedido: cuáles se recibieron, cuáles siguen esperando y cuáles quedaron sin mirar, para no pedir dos veces lo mismo. En construcción."
    />
  );
}
