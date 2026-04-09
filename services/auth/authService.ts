import type { SignInSchema } from '@/features/auth/schemas/signInSchema';

export const authService = {
  signIn: async (_payload: SignInSchema) => {
    // TODO: Replace mock auth handshake with real provider integration.
    return Promise.resolve({ accessToken: 'demo-token' });
  },
};
