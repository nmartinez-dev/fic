import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { canAccess, isRole, type Area, type Role } from '@/types/roles';

function isSupabaseAuthCookie(name: string): boolean {
  return name.startsWith('sb-') && name.includes('-auth-token');
}

function clearSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse
): void {
  for (const cookie of request.cookies.getAll()) {
    if (isSupabaseAuthCookie(cookie.name)) {
      response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' });
    }
  }
}

function isCorruptedAuthCookieError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('utf-8') ||
    message.includes('base64') ||
    message.includes('json')
  );
}

/** Deriva el area funcional a partir del pathname del dashboard. */
function areaForPath(pathname: string): Area | null {
  const rest = pathname.replace(/^\/dashboard\/?/, '');
  if (rest === '') return 'dashboard';
  const segment = rest.split('/')[0];
  switch (segment) {
    case 'proveedores':
      return 'proveedores';
    case 'facturas':
      return 'facturas';
    case 'ordenes':
      return 'ordenes';
    case 'rubros':
      return 'rubros';
    case 'vencimientos':
      return 'vencimientos';
    case 'revision':
      return 'revision';
    case 'ventas':
      return 'ventas';
    case 'avisos':
      return 'avisos';
    case 'settings':
      return 'settings';
    case 'usuarios':
      return 'usuarios';
    default:
      return null;
  }
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    if (!isCorruptedAuthCookieError(error)) {
      throw error;
    }
    clearSupabaseAuthCookies(request, response);
  }

  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith('/dashboard')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    const redirectResponse = NextResponse.redirect(redirectUrl);
    clearSupabaseAuthCookies(request, redirectResponse);
    return redirectResponse;
  }

  if (user && pathname === '/login') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // Guard por rol: nadie entra a un area que no le toca (defensa junto a RLS).
  if (user && pathname.startsWith('/dashboard')) {
    const area = areaForPath(pathname);
    if (area && area !== 'dashboard') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role: Role | null = isRole(profile?.role) ? profile.role : null;
      if (!role || !canAccess(role, area)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/dashboard';
        redirectUrl.search = '?denied=1';
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
