import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { BadgeCard } from '@/features/profile/components/BadgeCard';
import { useAchievements } from '@/features/profile/hooks/useAchievements';
import { useProfileStats } from '@/features/profile/hooks/useProfileStats';
import { useStreak } from '@/features/profile/hooks/useStreak';
import { useAuthStore } from '@/store/authStore';

export const AchievementsScreen = memo(() => {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { books, journalCount, reReadsCount, reviewsCount } = useProfileStats();
  const { data: streakData } = useStreak(userId);

  const achievements = useAchievements({
    books,
    currentStreak: streakData?.current ?? 0,
    journalCount,
    reReadsCount,
    reviewsCount,
  });

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
      <View className="flex-row items-center border-b border-[#f0f0f0] px-4 pb-4 pt-2">
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full"
          onPress={() => router.back()}
        >
          <Ionicons color="#313C5D" name="chevron-back" size={22} />
        </Pressable>
        <Text
          className="mr-9 flex-1 text-center text-[17px] font-semibold text-black"
          variant="body"
        >
          Achievements
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48, paddingHorizontal: 16, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-5 text-[14px] text-[#9b9b9b]" variant="body">
          {earnedCount} of {achievements.length} unlocked
        </Text>

        <View className="flex-row flex-wrap gap-[5%]">
          {achievements.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </View>

        {earnedCount === achievements.length && (
          <Text className="mt-6 text-center text-[14px] text-[#7851A9]" variant="body">
            You've earned all badges! 🎉
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});
AchievementsScreen.displayName = 'AchievementsScreen';
