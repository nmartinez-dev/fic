'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLES, ROLE_LABEL, type Role } from '@/types/roles';
import type { AdminUser } from '@/types/user-admin';
import { useCreateUserAdmin, useUpdateUserAdmin } from '@/hooks/use-users-admin';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUser | null;
};

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const isEdit = !!user;
  const crear = useCreateUserAdmin();
  const actualizar = useUpdateUserAdmin();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('compras');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open) {
      setEmail(user?.email ?? '');
      setFullName(user?.full_name ?? '');
      setRole(user?.role ?? 'compras');
      setPassword('');
    }
  }, [open, user]);

  const busy = crear.isPending || actualizar.isPending;

  const submit = () => {
    if (isEdit && user) {
      const input: {
        full_name?: string;
        role?: Role;
        password?: string;
      } = {
        full_name: fullName.trim(),
        role,
      };
      if (password.trim().length >= 8) {
        input.password = password.trim();
      }
      toast.promise(actualizar.mutateAsync({ id: user.id, input }), {
        loading: 'Guardando…',
        success: () => {
          onOpenChange(false);
          return 'Usuario actualizado.';
        },
        error: (e) => (e as Error).message,
      });
      return;
    }

    if (password.trim().length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    toast.promise(
      crear.mutateAsync({
        email: email.trim(),
        full_name: fullName.trim() || undefined,
        role,
        password: password.trim(),
      }),
      {
        loading: 'Creando usuario…',
        success: () => {
          onOpenChange(false);
          return 'Usuario creado.';
        },
        error: (e) => (e as Error).message,
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cambiá nombre, rol o contraseña. Dejá la contraseña vacía para no modificarla.'
              : 'El admin define la contraseña inicial. El usuario podrá cambiarla desde su menú.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {!isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@cordillera.com"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="user-name">Nombre</Label>
            <Input
              id="user-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre para mostrar"
            />
          </div>
          <div className="grid gap-2">
            <Label>Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-password">
              {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña inicial'}
            </Label>
            <PasswordInput
              id="user-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
              autoComplete="new-password"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={busy || (!isEdit && !email.trim())}
          >
            {isEdit ? 'Guardar' : 'Crear usuario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
