import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRole, type Role, type Area, canAccess } from '@/types/roles';

function normalizeRole(value: unknown): Role | null {
  if (value === 'owner') return 'admin';
  return isRole(value) ? value : null;
}

async function fetchProfileRole(userId: string): Promise<Role | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  const role = normalizeRole(profile?.role);
  if (role) return role;

  // En route handlers el JWT a veces no llega a PostgREST; leemos el rol con service role.
  const admin = createAdminClient();
  const { data: fallback } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return normalizeRole(fallback?.role);
}

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

  const role = await fetchProfileRole(user.id);

  return {
    id: user.id,
    email: user.email ?? '',
    role,
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
