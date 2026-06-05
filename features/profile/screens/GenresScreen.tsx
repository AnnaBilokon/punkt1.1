import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { GENRES, GenreChip } from '@/features/profile/components/GenreChip';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { profileService } from '@/services/profile/profileService';
import { useAuthStore } from '@/store/authStore';

export const GenresScreen = memo(() => {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { data: profile } = useProfile(userId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.preferredGenres) {
      setSelected(new Set(profile.preferredGenres));
    }
  }, [profile?.preferredGenres]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await profileService.updateGenres(userId, [...selected]);
      router.back();
    } catch {
      // non-critical
    } finally {
      setSaving(false);
    }
  };

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
          className="flex-1 text-center text-[17px] font-semibold text-black"
          variant="body"
        >
          Preferences & genres
        </Text>
        <Pressable
          className="h-9 items-center justify-center px-1"
          disabled={saving}
          onPress={() => void handleSave()}
          style={({ pressed }) => ({ opacity: saving ? 0.5 : pressed ? 0.6 : 1 })}
        >
          {saving ? (
            <ActivityIndicator color="#7851A9" size="small" />
          ) : (
            <Text className="text-[15px] font-semibold text-[#7851A9]" variant="body">
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48, paddingHorizontal: 16, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-5 text-[15px] text-[#555]" variant="body">
          Select the genres you enjoy reading. We&apos;ll use this to
          personalise your recommendations.
        </Text>

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

        {selected.size > 0 && (
          <Text className="mt-4 text-center text-[13px] text-[#9b9b9b]" variant="caption">
            {selected.size} genre{selected.size !== 1 ? 's' : ''} selected
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

GenresScreen.displayName = 'GenresScreen';
