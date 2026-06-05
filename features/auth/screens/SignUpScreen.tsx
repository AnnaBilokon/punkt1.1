import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Input } from '@/components/atoms/Input';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/molecules/Button';
import { Container } from '@/components/organisms/Container';
import { Screen } from '@/components/organisms/Screen';
import { useSignUpForm } from '@/features/auth/hooks/useSignUpForm';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';

export const SignUpScreen = () => {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useSignUpForm();

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const { data: result, error } = await authService.signUp(data);
    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }

    if (result.user) {
      setUser({
        avatarUrl: '',
        booksReadThisYear: 0,
        id: result.user.id,
        name: data.name,
        readingGoal: 0,
        username: result.user.email ?? '',
      });
      router.replace('/onboarding');
    }
  });

  return (
    <Screen>
      <Container className="flex-1 justify-center gap-8 py-12">
        <View className="gap-1">
          <Text variant="display">Sign up</Text>
          <Text variant="body" className="text-muted dark:text-mutedDark">
            Create your account
          </Text>
        </View>

        <View className="gap-4">
          <Input
            error={errors.name?.message}
            label="Name"
            onChangeText={(v) => setValue('name', v)}
            placeholder="Your name"
            value={watch('name')}
          />
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
          <Input
            error={errors.confirmPassword?.message}
            label="Confirm password"
            onChangeText={(v) => setValue('confirmPassword', v)}
            placeholder="••••••••"
            secureTextEntry
            value={watch('confirmPassword')}
          />
        </View>

        <View className="gap-3">
          <Button
            label={loading ? 'Creating account…' : 'Sign up'}
            onPress={onSubmit}
          />
          <Button
            label="Already have an account? Sign in"
            onPress={() => router.replace('/(auth)/sign-in')}
            tone="secondary"
          />
        </View>
      </Container>
    </Screen>
  );
};
