import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  type SignUpSchema,
  signUpSchema,
} from '@/features/auth/schemas/signUpSchema';

export const useSignUpForm = () =>
  useForm<SignUpSchema>({
    defaultValues: {
      confirmPassword: '',
      email: '',
      name: '',
      password: '',
    },
    mode: 'onChange',
    resolver: zodResolver(signUpSchema),
  });
