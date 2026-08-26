import Link from 'next/link';
import { getSessionUser } from '@/lib/auth/session';
import { navItemsForRole } from '@/lib/nav';
import { ROLE_LABEL } from '@/types/roles';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function DashboardHomePage() {
  const user = await getSessionUser();
  const role = user?.role ?? null;

  const shortcuts = role
    ? navItemsForRole(role).filter((i) => i.area !== 'dashboard')
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground">
          {role
            ? `Estás viendo el sistema como ${ROLE_LABEL[role]}.`
            : 'Tu usuario todavía no tiene un rol asignado. Pedile al dueño que te lo configure.'}
        </p>
      </div>

      {shortcuts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>Ir a {item.label.toLowerCase()}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
