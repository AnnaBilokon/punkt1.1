import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must contain at least 8 characters.'),
});

export type SignInSchema = z.infer<typeof signInSchema>;
