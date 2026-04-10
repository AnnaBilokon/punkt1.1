import type { SignInSchema } from '@/features/auth/schemas/signInSchema';
import type { SignUpSchema } from '@/features/auth/schemas/signUpSchema';
import { supabase } from '@/services/supabase';

export const authService = {
  changePassword: (newPassword: string) =>
    supabase.auth.updateUser({ password: newPassword }),

  getSession: () => supabase.auth.getSession(),

  signIn: ({ email, password }: SignInSchema) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  signUp: ({ email, name, password }: SignUpSchema) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    }),
};
