import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AuthorizationError, requireArea } from '@/lib/auth/session';
import { updateUserSchema } from '@/types/user-admin';
import type { AdminUser } from '@/types/user-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await requireArea('usuarios');
    const { id } = await context.params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { full_name, role, password } = parsed.data;
    if (full_name === undefined && role === undefined && password === undefined) {
      return NextResponse.json(
        { error: 'No hay cambios para guardar.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const authUpdate: {
      user_metadata?: { full_name: string };
      app_metadata?: { role: string };
      password?: string;
    } = {};

    if (full_name !== undefined) {
      authUpdate.user_metadata = { full_name };
    }
    if (role !== undefined) {
      authUpdate.app_metadata = { role };
    }
    if (password !== undefined) {
      authUpdate.password = password;
    }

    if (Object.keys(authUpdate).length > 0) {
      const { error: authErr } = await admin.auth.admin.updateUserById(
        id,
        authUpdate
      );
      if (authErr) throw new Error(authErr.message);
    }

    const profileUpdate: Record<string, unknown> = {};
    if (full_name !== undefined) profileUpdate.full_name = full_name || null;
    if (role !== undefined) profileUpdate.role = role;

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileErr } = await admin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', id);
      if (profileErr) throw new Error(profileErr.message);
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);

    return NextResponse.json(data as AdminUser);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await requireArea('usuarios');
    const { id } = await context.params;

    if (id === session.id) {
      return NextResponse.json(
        { error: 'No podés eliminar tu propia cuenta mientras estás logueado.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
