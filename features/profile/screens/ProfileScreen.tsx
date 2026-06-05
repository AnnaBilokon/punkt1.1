import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, GoalScrollPicker, Text } from '@/components';
import { getInitials } from '@/entities/user';
import {
  type Achievement,
  useAchievements,
} from '@/features/profile/hooks/useAchievements';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useProfileStats } from '@/features/profile/hooks/useProfileStats';
import { profileService } from '@/services/profile/profileService';
import { useAuthStore } from '@/store/authStore';
import { useChallengeStore } from '@/store/challengeStore';
import { useProfileStore } from '@/store/profileStore';

const BRAND = '#7851A9';

// ─── Stat item ────────────────────────────────────────────────────────────────

const StatItem = memo(
  ({ isFetching, label, value }: { isFetching: boolean; label: string; value: number }) => (
    <View className="flex-1 items-center gap-1">
      {isFetching ? (
        <View className="h-7 w-12 rounded-md bg-[#e8e8e8]" />
      ) : (
        <Text className="text-[22px] font-bold text-[#313C5D]" variant="body">
          {value.toLocaleString()}
        </Text>
      )}
      <Text className="text-center text-[11px] text-[#9b9b9b]" variant="caption">
        {label}
      </Text>
    </View>
  ),
);
StatItem.displayName = 'StatItem';

// ─── Achievement badge ─────────────────────────────────────────────────────────

const BadgeCard = memo(({ badge }: { badge: Achievement }) => {
  const onPress = useCallback(() => {
    if (badge.earned) {
      Alert.alert(badge.emoji + ' ' + badge.label, 'Achievement earned! 🎉');
    } else {
      Alert.alert('Locked', badge.hint);
    }
  }, [badge]);

  return (
    <Pressable
      className="w-[30%] items-center gap-2 rounded-[16px] border border-[#e8e8e8] bg-[#f9f9f9] py-4"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: !badge.earned ? 0.38 : pressed ? 0.7 : 1,
      })}
    >
      <Text className="text-[28px]" variant="body">
        {badge.emoji}
      </Text>
      <Text
        className="px-1 text-center text-[11px] font-medium text-[#313C5D]"
        numberOfLines={2}
        variant="caption"
      >
        {badge.label}
      </Text>
    </Pressable>
  );
});
BadgeCard.displayName = 'BadgeCard';

// ─── Settings row ──────────────────────────────────────────────────────────────

const SettingsRow = memo(
  ({
    destructive,
    label,
    onPress,
    subtitle,
  }: {
    destructive?: boolean;
    label: string;
    onPress: () => void;
    subtitle?: string;
  }) => (
    <Pressable
      className="flex-row items-center justify-between border-b border-[#f0f0f0] py-[14px]"
      onPress={onPress}
    >
      <View className="flex-1 gap-0.5">
        <Text
          className={`text-[15px] ${destructive ? 'text-[#e53935]' : 'text-black'}`}
          variant="body"
        >
          {label}
        </Text>
        {subtitle ? (
          <Text className="text-[12px] text-[#9b9b9b]" variant="caption">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {destructive ? null : (
        <Ionicons color="#c0c0c0" name="chevron-forward" size={18} />
      )}
    </Pressable>
  ),
);
SettingsRow.displayName = 'SettingsRow';

// ─── Edit Goal sheet ───────────────────────────────────────────────────────────

const EditGoalSheet = memo(
  ({ currentGoal, onClose, visible }: { currentGoal: number; onClose: () => void; visible: boolean }) => {
    const updateGoal = useChallengeStore((s) => s.updateGoal);
    const [value, setValue] = useState(currentGoal);

    return (
      <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
          <View className="gap-4 rounded-t-[28px] bg-white px-6 pb-10 pt-3">
            <View className="h-1 w-10 self-center rounded-full bg-[#d9d9d9]" />
            <Text className="text-center text-[18px] font-semibold text-black" variant="body">
              Reading goal
            </Text>
            <GoalScrollPicker initialValue={value} onChange={setValue} />
            <Text className="text-center text-[13px] text-[#9b9b9b]" variant="caption">
              books in {new Date().getFullYear()}
            </Text>
            <View className="flex-row gap-3">
              <Button className="flex-1" label="Cancel" onPress={onClose} tone="secondary" />
              <Button
                className="flex-1"
                label="Save"
                onPress={() => {
                  updateGoal(value);
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);
EditGoalSheet.displayName = 'EditGoalSheet';

// ─── Edit Profile sheet ────────────────────────────────────────────────────────

const EditProfileSheet = memo(
  ({
    initialBio,
    initialName,
    onClose,
    onSave,
    visible,
  }: {
    initialBio: string;
    initialName: string;
    onClose: () => void;
    onSave: (name: string, bio: string) => Promise<void>;
    visible: boolean;
  }) => {
    const [name, setName] = useState(initialName);
    const [bio, setBio] = useState(initialBio);
    const [saving, setSaving] = useState(false);

    const handleSave = useCallback(async () => {
      if (!name.trim()) return;
      setSaving(true);
      await onSave(name.trim(), bio.trim());
      setSaving(false);
    }, [name, bio, onSave]);

    return (
      <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
          <View className="gap-4 rounded-t-[28px] bg-white px-6 pb-10 pt-3">
            <View className="h-1 w-10 self-center rounded-full bg-[#d9d9d9]" />
            <Text className="text-[18px] font-semibold text-black" variant="body">
              Edit profile
            </Text>
            <View className="gap-1">
              <Text className="text-[13px] font-medium text-[#444]" variant="body">
                Display name
              </Text>
              <TextInput
                className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-4 text-[15px] text-black"
                maxLength={60}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#aaa"
                style={{ height: 48 }}
                value={name}
              />
            </View>
            <View className="gap-1">
              <Text className="text-[13px] font-medium text-[#444]" variant="body">
                Bio
              </Text>
              <TextInput
                className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-4 pt-3 text-[15px] text-black"
                maxLength={160}
                multiline
                numberOfLines={3}
                onChangeText={setBio}
                placeholder="A short bio…"
                placeholderTextColor="#aaa"
                style={{ height: 80, textAlignVertical: 'top' }}
                value={bio}
              />
            </View>
            <View className="flex-row gap-3">
              <Button className="flex-1" label="Cancel" onPress={onClose} tone="secondary" />
              <Button
                className="flex-1"
                disabled={!name.trim() || saving}
                label={saving ? 'Saving…' : 'Save'}
                onPress={handleSave}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);
EditProfileSheet.displayName = 'EditProfileSheet';

// ─── Change Password modal ─────────────────────────────────────────────────────

const ChangePasswordModal = memo(
  ({ onClose, visible }: { onClose: () => void; visible: boolean }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      if (visible) {
        setNewPassword('');
        setConfirm('');
      }
    }, [visible]);

    const handleSave = useCallback(async () => {
      if (newPassword.length < 6) {
        Alert.alert('Too short', 'Password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirm) {
        Alert.alert('Mismatch', 'Passwords do not match.');
        return;
      }
      setSaving(true);
      try {
        await profileService.changePassword(newPassword);
        Alert.alert('Done', 'Password updated successfully.');
        onClose();
      } catch (e) {
        Alert.alert('Error', e instanceof Error ? e.message : 'Could not update password.');
      } finally {
        setSaving(false);
      }
    }, [newPassword, confirm, onClose]);

    return (
      <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={onClose}
        >
          <Pressable
            className="mx-6 w-full rounded-[18px] bg-white px-6 py-6"
            onPress={() => {}}
          >
            <Text className="mb-4 text-[18px] font-semibold text-black" variant="body">
              Change password
            </Text>
            <View className="gap-3">
              <TextInput
                autoFocus
                className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-4 text-[15px] text-black"
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor="#aaa"
                secureTextEntry
                style={{ height: 48 }}
                value={newPassword}
              />
              <TextInput
                className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-4 text-[15px] text-black"
                onChangeText={setConfirm}
                onSubmitEditing={handleSave}
                placeholder="Confirm password"
                placeholderTextColor="#aaa"
                returnKeyType="done"
                secureTextEntry
                style={{ height: 48 }}
                value={confirm}
              />
            </View>
            <View className="mt-5 flex-row gap-3">
              <Pressable
                className="flex-1 items-center justify-center rounded-[10px] border border-[#d9d9d9] py-3"
                onPress={onClose}
              >
                <Text className="text-[14px] font-medium text-[#6d7a88]" variant="body">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-[2] items-center justify-center rounded-[10px] py-3"
                disabled={saving || !newPassword || !confirm}
                onPress={handleSave}
                style={{
                  backgroundColor: BRAND,
                  opacity: saving || !newPassword || !confirm ? 0.5 : 1,
                }}
              >
                <Text className="text-[14px] font-semibold text-white" variant="body">
                  {saving ? 'Saving…' : 'Update'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);
ChangePasswordModal.displayName = 'ChangePasswordModal';

// ─── Section header ────────────────────────────────────────────────────────────

const SectionLabel = memo(({ label }: { label: string }) => (
  <Text
    className="mb-1 text-[12px] font-medium uppercase tracking-widest text-[#9b9b9b]"
    variant="caption"
  >
    {label}
  </Text>
));
SectionLabel.displayName = 'SectionLabel';

// ─── Main screen ───────────────────────────────────────────────────────────────

export const ProfileScreen = memo(() => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const goal = useChallengeStore((s) => s.challenge.goal);
  const updateProfile = useProfileStore((s) => s.updateProfile);


  const { data: profile } = useProfile(user?.id ?? null);
  const { books, booksRead, isFetching, memberSince, reviewsCount, xp } = useProfileStats();
  const achievements = useAchievements(books, reviewsCount);

  const [goalSheetVisible, setGoalSheetVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editProfileKey, setEditProfileKey] = useState(0);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const setHomeWidgets = useProfileStore((s) => s.setHomeWidgets);
  const setTbrOrder = useProfileStore((s) => s.setTbrOrder);

  useEffect(() => {
    if (profile?.homeWidgets) setHomeWidgets(profile.homeWidgets);
    if (profile?.tbrOrder) setTbrOrder(profile.tbrOrder);
  }, [profile?.homeWidgets, profile?.tbrOrder, setHomeWidgets, setTbrOrder]);

  const allEarned = achievements.every((a) => a.earned);
  const initials = user ? getInitials(user) : '?';
  const displayName = profile?.displayName || user?.name || 'Reader';
  const avatarUri = profile?.avatarUrl || user?.avatarUrl || undefined;

  const handleAvatarPress = useCallback(async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to update your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: 'images',
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingAvatar(true);
    try {
      const publicUrl = await profileService.uploadAvatar(user.id, result.assets[0].uri);
      await updateProfile(user.id, {
        avatarUrl: publicUrl,
        bio: profile?.bio ?? null,
        displayName: profile?.displayName ?? '',
      });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  }, [user, profile, updateProfile]);

  const handleSaveProfile = useCallback(
    async (name: string, bio: string) => {
      if (!user) return;
      try {
        await updateProfile(user.id, {
          avatarUrl: profile?.avatarUrl ?? null,
          bio: bio || null,
          displayName: name,
        });
        setEditProfileVisible(false);
      } catch (e) {
        Alert.alert('Error', e instanceof Error ? e.message : 'Could not save profile.');
      }
    },
    [user, profile, updateProfile],
  );

  const handleSignOut = useCallback(() => {
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
  }, [signOut, router]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { style: 'cancel', text: 'Cancel' },
        {
          style: 'destructive',
          text: 'Delete my account',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Your reading history, shelves, and progress will be lost forever.',
              [
                { style: 'cancel', text: 'Cancel' },
                {
                  style: 'destructive',
                  text: 'Yes, delete',
                  onPress: async () => {
                    try {
                      await profileService.deleteAccount();
                      await signOut();
                      router.replace('/(auth)/welcome');
                    } catch (e) {
                      Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete account.');
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }, [signOut, router]);

  return (
    <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View className="items-center gap-3 bg-[#7851A9] px-6 pb-14 pt-10">
          <Pressable
            onPress={handleAvatarPress}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Avatar
              className="border-4 border-white/30"
              fallback={initials}
              size="lg"
              uri={avatarUri}
            />
            <View
              className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-white"
              style={{ elevation: 2 }}
            >
              {uploadingAvatar ? (
                <ActivityIndicator color={BRAND} size="small" />
              ) : (
                <Ionicons color={BRAND} name="camera-outline" size={14} />
              )}
            </View>
          </Pressable>

          <View className="items-center gap-1">
            <Text
              className="text-center text-[22px] font-bold text-white"
              numberOfLines={1}
              variant="body"
            >
              {displayName}
            </Text>
            {profile?.bio ? (
              <Text
                className="text-center text-[13px] text-white/80"
                numberOfLines={2}
                variant="caption"
              >
                {profile.bio}
              </Text>
            ) : null}
            <Text className="text-[13px] text-white/60" variant="caption">
              Reading since {memberSince}
            </Text>
          </View>
        </View>

        {/* ── Stats strip — overlaps hero ── */}
        <View className="-mt-10 px-4">
          <Card className="flex-row rounded-[20px] border-[#e8e8e8] bg-white px-4 py-5">
            <StatItem isFetching={isFetching} label="Books read" value={booksRead} />
            <View className="mx-2 w-[1px] bg-[#e8e8e8]" />
            <StatItem isFetching={isFetching} label="Reviews" value={reviewsCount} />
            <View className="mx-2 w-[1px] bg-[#e8e8e8]" />
            <StatItem isFetching={isFetching} label="XP points" value={xp} />
          </Card>
        </View>

        {/* ── Achievements ── */}
        <View className="mt-6 gap-4 px-4">
          <Text className="text-[17px] font-semibold text-black" variant="body">
            Achievements
          </Text>
          <View className="flex-row flex-wrap gap-[5%]">
            {achievements.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </View>
          {allEarned && (
            <Text className="mt-1 text-center text-[13px] text-[#7851A9]" variant="caption">
              You&apos;ve earned all badges! 🎉
            </Text>
          )}
        </View>

        {/* ── Settings ── */}
        <View className="mt-8 gap-2 px-4">

          {/* Preferences */}
          <SectionLabel label="Preferences" />
          <Card className="rounded-[16px] border-[#e8e8e8] bg-white px-4 py-0">
            <SettingsRow
              label="Preferences & genres"
              onPress={() => router.push('/genres' as any)}
            />
            <SettingsRow
              label="Reading goal"
              onPress={() => setGoalSheetVisible(true)}
              subtitle={`${goal} books in ${new Date().getFullYear()}`}
            />
          </Card>

          {/* Customise Home */}
          <SectionLabel label="Home Screen" />
          <Card className="rounded-[16px] border-[#e8e8e8] bg-white px-4 py-0">
            <SettingsRow
              label="Customise Home"
              onPress={() => router.push('/customise-home' as any)}
            />
          </Card>

          {/* Account */}
          <SectionLabel label="Account" />
          <Card className="rounded-[16px] border-[#e8e8e8] bg-white px-4 py-0">
            <SettingsRow
              label="Email"
              onPress={() => {}}
              subtitle={user?.username ?? ''}
            />
            <SettingsRow
              label="Edit profile"
              onPress={() => { setEditProfileKey(k => k + 1); setEditProfileVisible(true); }}
            />
            <SettingsRow
              label="Change password"
              onPress={() => setChangePasswordVisible(true)}
            />
            <SettingsRow
              label="Notifications"
              onPress={() => router.push('/notifications' as any)}
            />
            <SettingsRow
              label="Privacy"
              onPress={() => router.push('/privacy' as any)}
            />
            <SettingsRow
              label="Help & feedback"
              onPress={() => router.push('/help' as any)}
            />
            <SettingsRow destructive label="Sign out" onPress={handleSignOut} />
          </Card>

          {/* Delete account */}
          <Pressable
            className="mt-4 items-center py-3"
            onPress={handleDeleteAccount}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text className="text-[13px] text-[#b0b0b0]" variant="body">
              Delete account
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <EditGoalSheet
        currentGoal={goal}
        onClose={() => setGoalSheetVisible(false)}
        visible={goalSheetVisible}
      />
      <EditProfileSheet
        key={editProfileKey}
        initialBio={profile?.bio ?? ''}
        initialName={profile?.displayName || user?.name || ''}
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
        onSave={handleSaveProfile}
      />
      <ChangePasswordModal
        visible={changePasswordVisible}
        onClose={() => setChangePasswordVisible(false)}
      />
    </SafeAreaView>
  );
});

ProfileScreen.displayName = 'ProfileScreen';
