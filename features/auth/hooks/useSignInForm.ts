import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  type SignInSchema,
  signInSchema,
} from '@/features/auth/schemas/signInSchema';

export const useSignInForm = () =>
  useForm<SignInSchema>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
    resolver: zodResolver(signInSchema),
  });
