import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Text } from '@/components';
import { getInitials } from '@/entities/user';
import {
  type Achievement,
  useAchievements,
} from '@/features/profile/hooks/useAchievements';
import { useProfileStats } from '@/features/profile/hooks/useProfileStats';
import { useAuthStore } from '@/store/authStore';
import { useChallengeStore } from '@/store/challengeStore';

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatItem = memo(
  ({
    isFetching,
    label,
    value,
  }: {
    isFetching: boolean;
    label: string;
    value: number;
  }) => (
    <View className="flex-1 items-center gap-1">
      {isFetching ? (
        <View className="h-7 w-12 rounded-md bg-[#e8e8e8]" />
      ) : (
        <Text className="text-[22px] font-bold text-[#313C5D]" variant="body">
          {value.toLocaleString()}
        </Text>
      )}
      <Text
        className="text-center text-[11px] text-[#9b9b9b]"
        variant="caption"
      >
        {label}
      </Text>
    </View>
  ),
);
StatItem.displayName = 'StatItem';

// ─── Achievement badge ─────────────────────────────────────────────────────────

const BadgeCard = memo(({ badge }: { badge: Achievement }) => {
  const onPress = () => {
    if (badge.earned) {
      Alert.alert(badge.emoji + ' ' + badge.label, 'Achievement earned! 🎉');
    } else {
      Alert.alert('Locked', badge.hint);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={badge.earned ? 0.7 : 1}
      className="w-[30%] items-center gap-2 rounded-[16px] border border-[#e8e8e8] bg-[#f9f9f9] py-4"
      onPress={onPress}
      style={badge.earned ? undefined : { opacity: 0.38 }}
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
    </TouchableOpacity>
  );
});
BadgeCard.displayName = 'BadgeCard';

// ─── Settings row ──────────────────────────────────────────────────────────────

const SettingsRow = memo(
  ({
    destructive,
    label,
    onPress,
  }: {
    destructive?: boolean;
    label: string;
    onPress: () => void;
  }) => (
    <Pressable
      className="flex-row items-center justify-between border-b border-[#f0f0f0] py-[14px]"
      onPress={onPress}
    >
      <Text
        className={`text-[15px] ${destructive ? 'text-[#e53935]' : 'text-black'}`}
        variant="body"
      >
        {label}
      </Text>
      {destructive ? null : (
        <Ionicons color="#c0c0c0" name="chevron-forward" size={18} />
      )}
    </Pressable>
  ),
);
SettingsRow.displayName = 'SettingsRow';

// ─── Edit Goal sheet (inline) ──────────────────────────────────────────────────

const EditGoalSheet = memo(
  ({
    currentGoal,
    onClose,
    visible,
  }: {
    currentGoal: number;
    onClose: () => void;
    visible: boolean;
  }) => {
    const updateGoal = useChallengeStore((s) => s.updateGoal);
    const [value, setValue] = useState(currentGoal);

    return (
      <Modal
        animationType="slide"
        onRequestClose={onClose}
        transparent
        visible={visible}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable
            className="absolute inset-0 bg-black/40"
            onPress={onClose}
          />
          <View className="gap-6 rounded-t-[28px] bg-white px-6 pb-10 pt-3">
            <View className="h-1 w-10 self-center rounded-full bg-[#d9d9d9]" />
            <Text
              className="text-center text-[18px] font-semibold text-black"
              variant="body"
            >
              Reading goal
            </Text>
            <View className="flex-row items-center justify-center gap-6">
              <TouchableOpacity
                activeOpacity={0.7}
                className="h-12 w-12 items-center justify-center rounded-full bg-[#f0f0f0]"
                onPress={() => setValue((v) => Math.max(1, v - 1))}
              >
                <Ionicons color="#313C5D" name="remove" size={22} />
              </TouchableOpacity>
              <Text
                className="w-24 text-center text-[52px] font-bold text-[#797DEA]"
                variant="display"
              >
                {value}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="h-12 w-12 items-center justify-center rounded-full bg-[#f0f0f0]"
                onPress={() => setValue((v) => v + 1)}
              >
                <Ionicons color="#313C5D" name="add" size={22} />
              </TouchableOpacity>
            </View>
            <Text
              className="text-center text-[14px] text-[#9b9b9b]"
              variant="caption"
            >
              books in {new Date().getFullYear()}
            </Text>
            <View className="flex-row gap-3">
              <Button
                className="flex-1"
                label="Cancel"
                onPress={onClose}
                tone="secondary"
              />
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

// ─── Main screen ───────────────────────────────────────────────────────────────

export const ProfileScreen = memo(() => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const goal = useChallengeStore((s) => s.challenge.goal);

  const { books, booksRead, isFetching, memberSince, reviewsCount, xp } =
    useProfileStats();
  const achievements = useAchievements(books, reviewsCount);

  const [goalSheetVisible, setGoalSheetVisible] = useState(false);

  const initials = user ? getInitials(user) : '?';
  const allEarned = achievements.every((a) => a.earned);

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

  return (
    <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View className="items-center gap-3 bg-[#7851A9] px-6 pb-14 pt-10">
          <Avatar
            className="border-4 border-white/30"
            fallback={initials}
            size="lg"
            uri={user?.avatarUrl || undefined}
          />
          <Text
            className="text-center text-[22px] font-bold text-white"
            numberOfLines={1}
            variant="body"
          >
            {user?.name ?? 'Reader'}
          </Text>
          <Text className="text-[13px] text-white/70" variant="caption">
            Reading since {memberSince}
          </Text>
        </View>

        {/* ── Stats strip — overlaps hero ── */}
        <View className="-mt-10 px-4">
          <Card className="flex-row rounded-[20px] border-[#e8e8e8] bg-white px-4 py-5">
            <StatItem
              isFetching={isFetching}
              label="Books read"
              value={booksRead}
            />
            <View className="mx-2 w-[1px] bg-[#e8e8e8]" />
            <StatItem
              isFetching={isFetching}
              label="Reviews"
              value={reviewsCount}
            />
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
            <Text
              className="mt-1 text-center text-[13px] text-[#797DEA]"
              variant="caption"
            >
              You&apos;ve earned all badges! 🎉
            </Text>
          )}
        </View>

        {/* ── Settings ── */}
        <View className="mt-8 gap-2 px-4">
          <Text
            className="mb-1 text-[12px] font-medium uppercase tracking-widest text-[#9b9b9b]"
            variant="caption"
          >
            Preferences
          </Text>
          <Card className="rounded-[16px] border-[#e8e8e8] bg-white px-4 py-0">
            <SettingsRow
              label="Preferences & genres"
              onPress={() => router.push('/genres' as any)}
            />
            <SettingsRow
              label="Reading goal"
              onPress={() => setGoalSheetVisible(true)}
            />
          </Card>

          <Text
            className="mb-1 mt-4 text-[12px] font-medium uppercase tracking-widest text-[#9b9b9b]"
            variant="caption"
          >
            Account
          </Text>
          <Card className="rounded-[16px] border-[#e8e8e8] bg-white px-4 py-0">
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
            <SettingsRow destructive label="Sign out" onPress={onSignOut} />
          </Card>
        </View>
      </ScrollView>

      <EditGoalSheet
        currentGoal={goal}
        onClose={() => setGoalSheetVisible(false)}
        visible={goalSheetVisible}
      />
    </SafeAreaView>
  );
});

ProfileScreen.displayName = 'ProfileScreen';
