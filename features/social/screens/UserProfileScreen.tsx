import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { followingQueryKey } from '@/features/social/hooks/useFollowing';
import { friendActivityQueryKey } from '@/features/social/hooks/useFriendActivity';
import {
  publicProfileQueryKey,
  usePublicProfile,
  useUserPublicBooks,
} from '@/features/social/hooks/usePublicProfile';
import { useFollowStatus, followStatusQueryKey } from '@/features/social/hooks/useFollowStatus';
import { socialService } from '@/services/social/socialService';
import { useAuthStore } from '@/store/authStore';
import type { UserPublicBook } from '@/types';

const BRAND = '#7851A9';

const initials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const BookTile = memo(({ book }: { book: UserPublicBook }) => (
  <View style={{ width: 90, gap: 6 }}>
    {book.coverImage ? (
      <Image
        resizeMode="cover"
        source={{ uri: book.coverImage }}
        style={{ width: 90, height: 128, borderRadius: 8, backgroundColor: '#f1edf8' }}
      />
    ) : (
      <View
        style={{
          width: 90,
          height: 128,
          borderRadius: 8,
          backgroundColor: '#f1edf8',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons color={BRAND} name="book-outline" size={28} />
      </View>
    )}
    <Text numberOfLines={2} style={{ fontSize: 11, color: '#313C5D', fontWeight: '500', lineHeight: 15 }}>
      {book.title}
    </Text>
    {book.status === 'reading' && book.progress > 0 && (
      <View style={{ height: 3, backgroundColor: '#e8e8e8', borderRadius: 2, overflow: 'hidden' }}>
        <View
          style={{
            width: `${book.progress}%`,
            height: '100%',
            backgroundColor: BRAND,
            borderRadius: 2,
          }}
        />
      </View>
    )}
    {book.status === 'completed' && book.myRating != null && (
      <Text style={{ fontSize: 11, color: '#9b9b9b' }}>{'★'.repeat(book.myRating)}</Text>
    )}
  </View>
));
BookTile.displayName = 'BookTile';

type Props = { userId: string };

export const UserProfileScreen = memo(({ userId }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);

  const { data: profile, isLoading: profileLoading } = usePublicProfile(userId);
  const { data: books = [], isLoading: booksLoading } = useUserPublicBooks(userId);
  const { data: isFollowing = false } = useFollowStatus(currentUserId, userId);

  const [toggling, setToggling] = useState(false);

  const currentlyReading = books.filter((b) => b.status === 'reading');
  const recentlyFinished = books
    .filter((b) => b.status === 'completed')
    .sort((a, b) =>
      (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''),
    )
    .slice(0, 6);

  const handleToggleFollow = async () => {
    if (!currentUserId || toggling || currentUserId === userId) return;
    setToggling(true);
    try {
      if (isFollowing) {
        await socialService.unfollow(currentUserId, userId);
      } else {
        await socialService.follow(currentUserId, userId);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followStatusQueryKey(currentUserId, userId) }),
        queryClient.invalidateQueries({ queryKey: followingQueryKey(currentUserId) }),
        queryClient.invalidateQueries({ queryKey: friendActivityQueryKey(currentUserId) }),
        queryClient.invalidateQueries({ queryKey: publicProfileQueryKey(userId) }),
      ]);
    } finally {
      setToggling(false);
    }
  };

  if (profileLoading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
        <ActivityIndicator color={BRAND} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const displayName = profile?.displayName ?? 'Reader';
  const avatarUrl = profile?.avatarUrl ?? null;
  const isOwnProfile = currentUserId === userId;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}
      >
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons color="#313C5D" name="chevron-back" size={24} />
        </Pressable>
        <Text
          numberOfLines={1}
          style={{ flex: 1, fontSize: 17, fontWeight: '600', color: '#15151e', textAlign: 'center', marginRight: 24 }}
        >
          {displayName}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={{ alignItems: 'center', paddingTop: 28, paddingBottom: 20, gap: 12 }}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: '#f1edf8' }}
            />
          ) : (
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                backgroundColor: '#f1edf8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: '700', color: BRAND }}>
                {initials(displayName)}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#15151e' }}>{displayName}</Text>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 32 }}>
            {[
              { label: 'Books read', value: profile?.booksRead ?? 0 },
              { label: 'Followers', value: profile?.followersCount ?? 0 },
              { label: 'Following', value: profile?.followingCount ?? 0 },
            ].map((stat) => (
              <View key={stat.label} style={{ alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#313C5D' }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 11, color: '#9b9b9b' }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Follow button */}
          {!isOwnProfile && (
            <Pressable
              disabled={toggling}
              onPress={() => void handleToggleFollow()}
              style={{
                paddingHorizontal: 32,
                paddingVertical: 9,
                borderRadius: 22,
                backgroundColor: isFollowing ? '#fff' : BRAND,
                borderWidth: 1,
                borderColor: isFollowing ? '#d4bfed' : BRAND,
                opacity: toggling ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isFollowing ? BRAND : '#fff',
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 16 }} />

        {booksLoading ? (
          <ActivityIndicator color={BRAND} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Currently reading */}
            {currentlyReading.length > 0 && (
              <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#15151e' }}>
                  Currently Reading
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {currentlyReading.map((book) => (
                    <BookTile key={book.bookApiId} book={book} />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recently finished */}
            {recentlyFinished.length > 0 && (
              <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#15151e' }}>
                  Recently Finished
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {recentlyFinished.map((book) => (
                    <BookTile key={book.bookApiId} book={book} />
                  ))}
                </View>
              </View>
            )}

            {!currentlyReading.length && !recentlyFinished.length && (
              <View style={{ alignItems: 'center', paddingTop: 48, gap: 8 }}>
                <Ionicons color="#d9d9d9" name="book-outline" size={40} />
                <Text style={{ color: '#9b9b9b', fontSize: 14 }}>No books yet</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});
UserProfileScreen.displayName = 'UserProfileScreen';
