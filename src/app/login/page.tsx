'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Boxes, PackageCheck, CalendarClock, ShieldCheck } from 'lucide-react';

const features = [
  { icon: Boxes, text: 'Proveedores, precios y stock en un solo lugar' },
  { icon: PackageCheck, text: 'Facturas ordenadas, sin duplicados' },
  { icon: CalendarClock, text: 'Vencimientos y recibos siempre a la vista' },
  { icon: ShieldCheck, text: 'Cada uno entra solo a lo que le toca' },
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
            El negocio,
            <br />
            claro de un vistazo
          </h2>
          <p className="max-w-md text-lg text-primary-foreground/85">
            Todo lo que hoy está a mano y en cuadernos, ordenado en un solo
            sistema.
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
          &copy; {new Date().getFullYear()} · Sistema de gestión
        </p>
      </div>

      <div className="flex w-full items-center justify-center bg-background px-6 md:w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Iniciá sesión</h1>
            <p className="text-muted-foreground">Sistema de gestión Cordillera</p>
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
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
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
