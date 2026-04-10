import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, View } from 'react-native';

import { Input } from '@/components/atoms/Input';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/molecules/Button';
import { Container } from '@/components/organisms/Container';
import { Screen } from '@/components/organisms/Screen';
import {
  type SignInSchema,
  signInSchema,
} from '@/features/auth/schemas/signInSchema';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';

export const SignInScreen = () => {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<SignInSchema>({
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const { data: result, error } = await authService.signIn(data);
    setLoading(false);

    if (error) {
      Alert.alert('Sign in failed', error.message);
      return;
    }

    if (result.user) {
      setUser({
        avatarUrl: '',
        booksReadThisYear: 0,
        id: result.user.id,
        name: result.user.user_metadata?.['name'] ?? '',
        readingGoal: 0,
        username: result.user.email ?? '',
      });
      router.replace('/(tabs)/library');
    }
  });

  return (
    <Screen>
      <Container className="flex-1 justify-center gap-8 py-12">
        <View className="gap-1">
          <Text variant="display">Sign in</Text>
          <Text variant="body" className="text-muted dark:text-mutedDark">
            Welcome back
          </Text>
        </View>

        <View className="gap-4">
          <Input
            autoCapitalize="none"
            error={errors.email?.message}
            keyboardType="email-address"
            label="Email"
            onChangeText={(v) => setValue('email', v)}
            placeholder="you@example.com"
            value={watch('email')}
          />
          <Input
            error={errors.password?.message}
            label="Password"
            onChangeText={(v) => setValue('password', v)}
            placeholder="••••••••"
            secureTextEntry
            value={watch('password')}
          />
        </View>

        <View className="gap-3">
          <Button
            label={loading ? 'Signing in…' : 'Sign in'}
            onPress={onSubmit}
          />
          <Button
            label="Don't have an account? Sign up"
            onPress={() => router.replace('/(auth)/sign-up')}
            tone="secondary"
          />
        </View>
      </Container>
    </Screen>
  );
};
