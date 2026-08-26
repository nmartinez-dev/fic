import type {
  AdminUser,
  CreateUserInput,
  UpdateUserInput,
} from '@/types/user-admin';

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Error en la solicitud');
  return json as T;
}

export async function listUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/users');
  return parseJson<AdminUser[]>(res);
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseJson<AdminUser>(res);
}

export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<AdminUser> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseJson<AdminUser>(res);
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
  await parseJson<{ ok: boolean }>(res);
}
