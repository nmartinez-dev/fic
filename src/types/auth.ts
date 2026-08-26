import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Role } from '@/types/roles';

export type User = {
  id: string;
  email: string;
  fullName?: string;
  /** Rol resuelto desde la tabla `profiles`. Null mientras se carga el perfil. */
  role: Role | null;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
};

export type AuthContextType = AuthState & {
  loginWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
};

export function mapSupabaseUserToUser(
  supabaseUser: SupabaseUser,
  role: Role | null
): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    fullName:
      supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name,
    role,
  };
}
