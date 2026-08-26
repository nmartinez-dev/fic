'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as userAdminService from '@/services/user-admin-service';
import type { CreateUserInput, UpdateUserInput } from '@/types/user-admin';

export function useUsersAdmin() {
  return useQuery({
    queryKey: queryKeys.usersAdmin,
    queryFn: userAdminService.listUsers,
  });
}

export function useCreateUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => userAdminService.createUser(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.usersAdmin }),
  });
}

export function useUpdateUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      userAdminService.updateUser(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.usersAdmin }),
  });
}

export function useDeleteUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userAdminService.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.usersAdmin }),
  });
}
