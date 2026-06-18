import { z } from 'zod';
import { UserStatus } from '../../constants/UserStatus.enum.js';

// Esquema para crear un usuario
export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' })
    .trim(),
  lastName: z
    .string()
    .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    .max(100, { message: 'El apellido no puede exceder 100 caracteres' })
    .trim(),
  identificationNumber: z
    .string()
    .min(5, { message: 'El número de identificación debe tener al menos 5 caracteres' })
    .max(20, { message: 'El número de identificación no puede exceder 20 caracteres' })
    .trim(),
  dateOfBirth: z.coerce
    .date()
    .max(new Date(), { message: 'La fecha de nacimiento no puede ser futura' }),
  email: z.string().email({ message: 'Debes proporcionar un email válido' }).toLowerCase(),
  phoneNumber: z
    .string()
    .regex(/^[0-9\s\-+()]{7,20}$/, { message: 'El número de teléfono no es válido' })
    .trim(),
});

// Esquema para actualizar un usuario
export const updateUserSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
      .max(100, { message: 'El nombre no puede exceder 100 caracteres' })
      .trim()
      .optional(),
    lastName: z
      .string()
      .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
      .max(100, { message: 'El apellido no puede exceder 100 caracteres' })
      .trim()
      .optional(),
    identificationNumber: z
      .string()
      .min(5, { message: 'El número de identificación debe tener al menos 5 caracteres' })
      .max(20, { message: 'El número de identificación no puede exceder 20 caracteres' })
      .trim()
      .optional(),
    dateOfBirth: z.coerce
      .date()
      .max(new Date(), { message: 'La fecha de nacimiento no puede ser futura' })
      .optional(),
    email: z
      .string()
      .email({ message: 'Debes proporcionar un email válido' })
      .toLowerCase()
      .optional(),
    phoneNumber: z
      .string()
      .regex(/^[0-9\s\-+()]{7,20}$/, { message: 'El número de teléfono no es válido' })
      .trim()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes proporcionar al menos un campo para actualizar',
  });

// Esquema para parámetros de ID
export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, { message: 'El ID debe ser un número' })
    .transform((val) => parseInt(val, 10)),
});

// Esquema para query de status
export const userStatusQuerySchema = z.object({
  status: z.nativeEnum(UserStatus).optional().default(UserStatus.ACTIVE),
});

// Tipos exportados desde los esquemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UserStatusQuery = z.infer<typeof userStatusQuerySchema>;
