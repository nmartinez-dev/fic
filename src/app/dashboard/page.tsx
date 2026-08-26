import { DashboardHome } from '@/components/dashboard/dashboard-home';
import { getSessionUser } from '@/lib/auth/session';

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();

  return (
    <div className="space-y-6">
      {params.denied === '1' && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-foreground">
          No tenés permisos para acceder a esa sección.
        </div>
      )}
      <DashboardHome role={user?.role ?? null} email={user?.email ?? null} />
    </div>
  );
}
