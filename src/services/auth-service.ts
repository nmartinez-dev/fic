import { createClient } from '@/lib/supabase/client';
import { isRole, type Role } from '@/types/roles';

export async function loginWithPassword(
  email: string,
  password: string
): Promise<{ error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('invalid')) {
        return { error: 'Email o contraseña incorrectos.' };
      }
      return { error: error.message };
    }

    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Error al iniciar sesión.',
    };
  }
}

export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/** Lee el rol del perfil del usuario autenticado (o null si no hay perfil). */
export async function fetchRole(userId: string): Promise<Role | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return isRole(data.role) ? data.role : null;
}
