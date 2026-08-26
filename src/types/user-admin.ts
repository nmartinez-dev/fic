import { z } from 'zod';
import { ROLES } from '@/types/roles';

export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: (typeof ROLES)[number];
  created_at: string;
};

const passwordSchema = z.string().min(8, 'Mínimo 8 caracteres');

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().trim().optional(),
  role: z.enum(ROLES),
  password: passwordSchema,
});

export const updateUserSchema = z.object({
  full_name: z.string().trim().optional(),
  role: z.enum(ROLES).optional(),
  password: passwordSchema.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
