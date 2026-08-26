import { CalendarClock } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

export default function VencimientosPage() {
  return (
    <PlaceholderPage
      icon={CalendarClock}
      title="Vencimientos"
      description="Calendario visual de vencimientos, con recibos generados y alertas antes de que se pase la fecha. Se actualiza en vivo entre varias personas. En construcción."
    />
  );
}
