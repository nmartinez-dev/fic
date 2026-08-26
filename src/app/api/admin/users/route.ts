import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AuthorizationError, requireArea } from '@/lib/auth/session';
import { createUserSchema } from '@/types/user-admin';
import type { AdminUser } from '@/types/user-admin';

export async function GET() {
  try {
    await requireArea('usuarios');
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json((data ?? []) as AdminUser[]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireArea('usuarios');
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { email, full_name, role, password } = parsed.data;
    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: full_name ? { full_name } : undefined,
      app_metadata: { role },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already') || msg.includes('registered')) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con ese email.' },
          { status: 409 }
        );
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No se pudo crear el usuario');
    }

    await admin.from('profiles').upsert({
      id: data.user.id,
      email: email.trim().toLowerCase(),
      full_name: full_name?.trim() || null,
      role,
    });

    const user: AdminUser = {
      id: data.user.id,
      email: email.trim().toLowerCase(),
      full_name: full_name?.trim() || null,
      role,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
