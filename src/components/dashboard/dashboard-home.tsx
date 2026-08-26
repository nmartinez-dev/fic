'use client';

import { LayoutDashboard } from 'lucide-react';
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  FileText,
  Inbox,
  Tag,
  Tags,
} from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiStatCard } from '@/components/dashboard/kpi-stat-card';
import { GastoRubroChart } from '@/components/dashboard/gasto-rubro-chart';
import {
  isDashboardOperativoRole,
  useDashboardOperativo,
  useDashboardVentas,
} from '@/hooks/use-dashboard';
import { formatCurrency, formatDate } from '@/lib/format';
import { ROLE_LABEL, type Role } from '@/types/roles';

type DashboardHomeProps = {
  role: Role | null;
  email: string | null;
};

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
  );
}

function DashboardOperativo() {
  const { data, isLoading, isError, error } = useDashboardOperativo(true);

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        {(error as Error)?.message ?? 'No se pudieron cargar los indicadores.'}
      </p>
    );
  }

  const revisionTotal = data.revisionPendientes + data.facturasEnRevision;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiStatCard
          label="Revisión pendiente"
          value={String(revisionTotal)}
          hint={
            revisionTotal > 0
              ? `${data.revisionPendientes} en cola · ${data.facturasEnRevision} facturas`
              : 'Nada esperando confirmación'
          }
          href="/dashboard/revision"
          icon={Inbox}
          accent={revisionTotal > 0 ? 'warning' : 'default'}
        />
        <KpiStatCard
          label="Saldo impago"
          value={formatCurrency(data.saldoImpago)}
          hint={
            data.facturasConSaldo > 0
              ? `${data.facturasConSaldo} factura${data.facturasConSaldo === 1 ? '' : 's'} con saldo`
              : 'Cuenta al día'
          }
          href="/dashboard/facturas"
          icon={FileText}
          accent={data.saldoImpago > 0 ? 'warning' : 'default'}
        />
        <KpiStatCard
          label="Órdenes abiertas"
          value={String(data.ordenesAbiertas)}
          hint={
            data.ordenesAbiertas > 0
              ? 'Pendientes o recepción parcial'
              : 'Sin pedidos sin cerrar'
          }
          href="/dashboard/ordenes?filtro=pendientes"
          icon={ClipboardList}
          accent={data.ordenesAbiertas > 0 ? 'warning' : 'default'}
        />
        <KpiStatCard
          label="Avisos sin resolver"
          value={String(data.avisosPendientes)}
          hint={data.avisosPendientes > 0 ? 'Requieren atención' : 'Bandeja al día'}
          href="/dashboard/avisos"
          icon={Bell}
          accent={data.avisosPendientes > 0 ? 'danger' : 'default'}
        />
        <KpiStatCard
          label="Lista de precios"
          value={
            data.preciosFechaLista
              ? formatDate(data.preciosFechaLista)
              : 'Sin datos'
          }
          hint={
            data.preciosSyncFallo
              ? 'Último sync falló — revisar avisos'
              : data.preciosCount > 0
                ? `${data.preciosCount} productos`
                : 'Todavía no se sincronizó'
          }
          href="/dashboard/precios"
          icon={Tag}
          accent={data.preciosSyncFallo ? 'danger' : 'default'}
        />
        {data.preciosSyncFallo ? (
          <KpiStatCard
            label="Sync de precios"
            value="Falló"
            hint="Entrá a Precios o Avisos para ver el detalle"
            href="/dashboard/precios"
            icon={AlertTriangle}
            accent="danger"
          />
        ) : null}
      </div>

      <GastoRubroChart data={data.gastoPorRubro} />
    </div>
  );
}

function DashboardVentas() {
  const { data, isLoading, isError, error } = useDashboardVentas(true);

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        {(error as Error)?.message ?? 'No se pudieron cargar los indicadores.'}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <KpiStatCard
        label="Lista de precios"
        value={
          data.preciosFechaLista ? formatDate(data.preciosFechaLista) : 'Sin datos'
        }
        hint={
          data.preciosCount > 0
            ? `${data.preciosCount} productos en la última lista`
            : 'Todavía no hay precios cargados'
        }
        href="/dashboard/precios"
        icon={Tag}
      />
      <KpiStatCard
        label="Categorías"
        value={String(data.categoriasCount)}
        hint="Rubros canónicos disponibles para consulta"
        href="/dashboard/categorias"
        icon={Tags}
      />
    </div>
  );
}

export function DashboardHome({ role, email }: DashboardHomeProps) {
  const operativo = isDashboardOperativoRole(role);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <FeatureIcon icon={LayoutDashboard} size="md" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola{email ? `, ${email.split('@')[0]}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground">
            {role
              ? operativo
                ? `Pulso operativo · ${ROLE_LABEL[role]}`
                : `Consulta · ${ROLE_LABEL[role]}`
              : 'Tu usuario todavía no tiene un rol asignado.'}
          </p>
        </div>
      </div>

      {role ? operativo ? <DashboardOperativo /> : <DashboardVentas /> : null}
    </div>
  );
}
