import { z } from 'zod';

export const signUpSchema = z
  .object({
    confirmPassword: z
      .string()
      .min(8, 'Password must contain at least 8 characters.'),
    email: z.string().email('Enter a valid email address.'),
    name: z.string().min(1, 'Name is required.'),
    password: z.string().min(8, 'Password must contain at least 8 characters.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
