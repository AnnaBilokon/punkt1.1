import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Pressable, View } from 'react-native';

import { Avatar, Text } from '@/components';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/molecules/Button';
import { Container } from '@/components/organisms/Container';
import { Screen } from '@/components/organisms/Screen';
import {
  type ChangePasswordSchema,
  changePasswordSchema,
} from '@/features/auth/schemas/changePasswordSchema';
import { authService } from '@/services/auth/authService';
import { useAuthStore } from '@/store/authStore';

const SectionTitle = ({ title }: { title: string }) => (
  <Text
    variant="caption"
    className="mb-2 uppercase tracking-widest text-textMuted dark:text-textMutedDark"
  >
    {title}
  </Text>
);

const SettingsRow = ({
  label,
  value,
  onPress,
  destructive,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center justify-between border-b border-border py-4 dark:border-borderDark"
  >
    <Text
      variant="body"
      className={destructive ? 'text-danger' : 'text-text dark:text-textDark'}
    >
      {label}
    </Text>
    {value ? (
      <Text variant="body" className="text-textMuted dark:text-textMutedDark">
        {value}
      </Text>
    ) : null}
  </Pressable>
);

export const ProfileScreen = () => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<ChangePasswordSchema>({
    defaultValues: {
      confirmPassword: '',
      currentPassword: '',
      newPassword: '',
    },
    mode: 'onChange',
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = handleSubmit(
    async ({ currentPassword, newPassword }) => {
      if (!user?.username) return;
      setLoading(true);

      // Re-authenticate with current password first
      const { error: signInError } = await authService.signIn({
        email: user.username,
        password: currentPassword,
      });

      if (signInError) {
        setLoading(false);
        Alert.alert('Error', 'Current password is incorrect.');
        return;
      }

      const { error } = await authService.changePassword(newPassword);
      setLoading(false);

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      Alert.alert('Success', 'Your password has been updated.');
      reset();
      setShowPasswordForm(false);
    },
  );

  const onSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
        style: 'destructive',
        text: 'Sign out',
      },
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <Screen contentClassName="pt-6">
      <Container className="gap-8">
        {/* Avatar + name */}
        <View className="items-center gap-3 pt-4">
          <Avatar
            fallback={initials}
            size="lg"
            uri={user?.avatarUrl || undefined}
          />
          <View className="items-center gap-0.5">
            <Text variant="title">{user?.name || 'Reader'}</Text>
            <Text
              variant="body"
              className="text-textMuted dark:text-textMutedDark"
            >
              {user?.username || ''}
            </Text>
          </View>
        </View>

        {/* Account info */}
        <View>
          <SectionTitle title="Account" />
          <View className="rounded-[7px] bg-white px-4 dark:bg-surfaceDark">
            <SettingsRow label="Name" value={user?.name || '—'} />
            <SettingsRow label="Email" value={user?.username || '—'} />
          </View>
        </View>

        {/* Security */}
        <View>
          <SectionTitle title="Security" />
          <View className="rounded-[7px] bg-white px-4 dark:bg-surfaceDark">
            <SettingsRow
              label="Change password"
              onPress={() => setShowPasswordForm((v) => !v)}
            />
          </View>

          {showPasswordForm ? (
            <View className="mt-4 gap-4">
              <Input
                error={errors.currentPassword?.message}
                label="Current password"
                onChangeText={(v) => setValue('currentPassword', v)}
                placeholder="••••••••"
                secureTextEntry
                value={watch('currentPassword')}
              />
              <Input
                error={errors.newPassword?.message}
                label="New password"
                onChangeText={(v) => setValue('newPassword', v)}
                placeholder="••••••••"
                secureTextEntry
                value={watch('newPassword')}
              />
              <Input
                error={errors.confirmPassword?.message}
                label="Confirm new password"
                onChangeText={(v) => setValue('confirmPassword', v)}
                placeholder="••••••••"
                secureTextEntry
                value={watch('confirmPassword')}
              />
              <View className="flex-row gap-3">
                <Button
                  className="flex-1"
                  label="Cancel"
                  onPress={() => {
                    reset();
                    setShowPasswordForm(false);
                  }}
                  tone="secondary"
                />
                <Button
                  className="flex-1"
                  label={loading ? 'Saving…' : 'Save'}
                  onPress={onChangePassword}
                />
              </View>
            </View>
          ) : null}
        </View>

        {/* Sign out */}
        <View>
          <View className="rounded-[7px] bg-white px-4 dark:bg-surfaceDark">
            <SettingsRow destructive label="Sign out" onPress={onSignOut} />
          </View>
        </View>
      </Container>
    </Screen>
  );
};
