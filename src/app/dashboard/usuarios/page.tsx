'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useUsersAdmin,
  useDeleteUserAdmin,
} from '@/hooks/use-users-admin';
import { UserFormDialog } from '@/components/usuarios/user-form-dialog';
import { useAuth } from '@/contexts/auth-context';
import { ROLE_LABEL } from '@/types/roles';
import { formatDateTime } from '@/lib/format';
import type { AdminUser } from '@/types/user-admin';

const ROLE_CLS: Record<AdminUser['role'], string> = {
  admin: 'bg-primary/15 text-primary',
  compras: 'bg-warning/15 text-warning',
  ventas: 'bg-success/15 text-success',
};

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, isError, error } = useUsersAdmin();
  const eliminar = useDeleteUserAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditingUser] = useState<AdminUser | null>(null);

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setFormOpen(true);
  };

  const handleDelete = (u: AdminUser) => {
    toast.promise(eliminar.mutateAsync(u.id), {
      loading: 'Eliminando…',
      success: 'Usuario eliminado.',
      error: (e) => (e as Error).message,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeatureIcon icon={Users} size="md" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
            <p className="text-sm text-muted-foreground">
              Alta, edición y baja de cuentas. Solo el administrador gestiona accesos y
              contraseñas.
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/5 py-16 text-center text-sm text-danger">
          {(error as Error).message}
        </div>
      ) : !users || users.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Todavía no hay usuarios cargados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Alta</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {u.full_name ?? '—'}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (vos)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.email ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={ROLE_CLS[u.role]}>
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(u.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(u)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              u.id === currentUser?.id || eliminar.isPending
                            }
                            className="text-danger hover:text-danger"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se borrará la cuenta de{' '}
                              <span className="font-medium text-foreground">
                                {u.email}
                              </span>
                              . Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(u)}
                              className="bg-danger text-white hover:bg-danger/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
      />
    </div>
  );
}
