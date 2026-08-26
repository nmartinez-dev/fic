import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { isRole, type Role, type Area, canAccess } from '@/types/roles';

export type SessionUser = {
  id: string;
  email: string;
  role: Role | null;
};

/** Usuario autenticado + rol (leido de `profiles`) para SC y route handlers. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? '',
    role: isRole(profile?.role) ? profile.role : null,
  };
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Exige sesion y acceso a un area. Lanza AuthorizationError si falta.
 * Pensado para route handlers (traducir a 401/403).
 */
export async function requireArea(area: Area): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthorizationError('No autenticado', 401);
  if (!user.role || !canAccess(user.role, area)) {
    throw new AuthorizationError('Sin permisos para esta sección', 403);
  }
  return user;
}
