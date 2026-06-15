import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalScrollPicker } from '@/components';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/molecules/Button';
import { GENRES, GenreChip } from '@/features/profile/components/GenreChip';
import { profileService } from '@/services/profile/profileService';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useChallengeStore } from '@/store/challengeStore';

const STEPS = 4;

export const OnboardingScreen = memo(() => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateGoal = useChallengeStore((s) => s.updateGoal);
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [goal, setGoal] = useState(12);
  const [goalTouched, setGoalTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const confirmGoal = () => {
    if (goalTouched) updateGoal(goal);
    setStep(3);
  };

  const complete = async () => {
    setSaving(true);
    if (user) {
      try {
        await profileService.initProfile(user.id, user.name ?? '', [...selected]);
      } catch {
        // non-critical — can be set later in Profile
      }
    }
    setSaving(false);
    setOnboardingCompleted();
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top', 'bottom']}>
      {/* Step indicator */}
      <View className="flex-row justify-center gap-2 pt-5">
        {Array.from({ length: STEPS }).map((_, i) => (
          <View
            key={i}
            className="rounded-full"
            style={{
              backgroundColor: i === step ? '#7851A9' : '#e0e0e0',
              height: 6,
              width: i === step ? 20 : 6,
            }}
          />
        ))}
      </View>

      {/* Step 0 — Welcome */}
      {step === 0 && (
        <View className="flex-1 items-center justify-center gap-8 px-8">
          <Text className="text-[64px]" variant="body">📚</Text>
          <View className="items-center gap-3">
            <Text className="text-center text-[28px] font-bold text-black" variant="body">
              Welcome, {firstName}!
            </Text>
            <Text className="text-center text-[15px] leading-[22px] text-[#6d6d6d]" variant="body">
              Let's set up your reading space so you get the most out of Punkt.
            </Text>
          </View>
          <View className="w-full">
            <Button label="Get started" onPress={() => setStep(1)} />
          </View>
        </View>
      )}

      {/* Step 1 — Genres */}
      {step === 1 && (
        <View className="flex-1">
          <View className="flex-row items-start justify-between px-5 pt-6 pb-2">
            <View className="flex-1 pr-4">
              <Text className="text-[22px] font-bold text-black" variant="body">
                What do you like to read?
              </Text>
              <Text className="mt-1 text-[14px] text-[#9b9b9b]" variant="body">
                Pick as many as you like.
              </Text>
            </View>
            <Pressable
              onPress={() => setStep(2)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingTop: 4 })}
            >
              <Text className="text-[14px] font-medium text-[#7851A9]" variant="body">Skip</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 20, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row flex-wrap">
              {GENRES.map((genre) => (
                <GenreChip
                  genre={genre}
                  key={genre.id}
                  onToggle={toggle}
                  selected={selected.has(genre.id)}
                />
              ))}
            </View>
          </ScrollView>
          <View className="px-5 pb-6">
            <Button
              label={selected.size > 0 ? `Next · ${selected.size} selected` : 'Next'}
              onPress={() => setStep(2)}
            />
          </View>
        </View>
      )}

      {/* Step 2 — Reading goal */}
      {step === 2 && (
        <View className="flex-1">
          <View className="flex-row items-start justify-between px-5 pt-6 pb-2">
            <View className="flex-1 pr-4">
              <Text className="text-[22px] font-bold text-black" variant="body">
                Set your reading goal
              </Text>
              <Text className="mt-1 text-[14px] text-[#9b9b9b]" variant="body">
                How many books this year?
              </Text>
            </View>
            <Pressable
              onPress={() => setStep(3)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingTop: 4 })}
            >
              <Text className="text-[14px] font-medium text-[#7851A9]" variant="body">Skip</Text>
            </Pressable>
          </View>
          <View className="flex-1 justify-center">
            <GoalScrollPicker
              initialValue={goal}
              onChange={(v) => {
                setGoal(v);
                setGoalTouched(true);
              }}
            />
          </View>
          <View className="px-5 pb-6">
            <Button
              label={`Let's go · ${goal} books`}
              onPress={confirmGoal}
            />
          </View>
        </View>
      )}

      {/* Step 3 — Done */}
      {step === 3 && (
        <View className="flex-1 items-center justify-center gap-8 px-8">
          <Text className="text-[64px]" variant="body">🎉</Text>
          <View className="items-center gap-3">
            <Text className="text-center text-[28px] font-bold text-black" variant="body">
              You're all set!
            </Text>
            <Text className="text-center text-[15px] leading-[22px] text-[#6d6d6d]" variant="body">
              {selected.size > 0
                ? `${selected.size} genre${selected.size !== 1 ? 's' : ''} selected · Goal: ${goalTouched ? goal : 12} books this year`
                : `Your reading journey starts now.`}
            </Text>
          </View>
          <View className="w-full">
            {saving ? (
              <ActivityIndicator color="#7851A9" />
            ) : (
              <Button label="Start reading" onPress={() => void complete()} />
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
});
OnboardingScreen.displayName = 'OnboardingScreen';
