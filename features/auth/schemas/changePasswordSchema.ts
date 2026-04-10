import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    confirmPassword: z
      .string()
      .min(8, 'Password must contain at least 8 characters.'),
    currentPassword: z
      .string()
      .min(8, 'Password must contain at least 8 characters.'),
    newPassword: z
      .string()
      .min(8, 'Password must contain at least 8 characters.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password.',
    path: ['newPassword'],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
