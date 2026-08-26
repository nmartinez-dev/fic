'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { FileText, ClipboardList, Tag, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: FileText,
    text: 'Ingesta y consolidación de facturas con revisión de excepciones',
  },
  {
    icon: ClipboardList,
    text: 'Seguimiento de órdenes de compra y alertas operativas',
  },
  {
    icon: Tag,
    text: 'Sincronización de listas de precios del proveedor',
  },
  {
    icon: ShieldCheck,
    text: 'Permisos por rol con control en base de datos',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, loginWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('error');
    if (code === 'expired') {
      setError('Tu sesión expiró. Volvé a iniciar sesión.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    const result = await loginWithPassword(email, password);
    if (result.error) {
      setError(result.error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground md:flex">
        <div className="text-2xl font-bold tracking-tight">
          Ferretería Industrial Cordillera
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight lg:text-5xl">
            Gestión operativa
            <br />
            de compras
          </h2>
          <p className="max-w-md text-lg text-primary-foreground/85">
            Facturación, pedidos, precios y categorías en una plataforma
            unificada, con trazabilidad por usuario y resolución guiada de
            inconsistencias.
          </p>
          <ul className="space-y-3 pt-4">
            {features.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3">
                <feature.icon className="h-5 w-5 shrink-0" />
                <span className="text-primary-foreground/90">
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Ferretería Industrial Cordillera
        </p>
      </div>

      <div className="flex w-full items-center justify-center bg-background px-6 md:w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
            <p className="text-muted-foreground">
              Acceso al panel de gestión
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@cordillera.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
