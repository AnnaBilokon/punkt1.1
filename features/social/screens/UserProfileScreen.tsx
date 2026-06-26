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

const BRAND = '#c1eeff';

const CARD: object = {
  backgroundColor: 'rgba(255,255,255,0.74)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#e0dbd5',
};

const initials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// ─── Reading book card ────────────────────────────────────────────────────────

const ReadingBookCard = memo(({ book }: { book: UserPublicBook }) => (
  <View style={{ flexDirection: 'row', gap: 12 }}>
    {book.coverImage ? (
      <Image
        resizeMode="cover"
        source={{ uri: book.coverImage }}
        style={{ width: 68, height: 98, borderRadius: 10, backgroundColor: '#e2f5ff' }}
      />
    ) : (
      <View style={{ width: 68, height: 98, borderRadius: 10, backgroundColor: '#e2f5ff', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons color="#655356" name="book-outline" size={24} />
      </View>
    )}
    <View style={{ flex: 1, justifyContent: 'center', gap: 5 }}>
      <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '700', color: '#28231c', lineHeight: 19 }}>
        {book.title}
      </Text>
      <Text numberOfLines={1} style={{ fontSize: 12, color: '#655356' }}>
        {book.author}
      </Text>
      <View style={{ gap: 3, marginTop: 2 }}>
        <View style={{ height: 5, backgroundColor: '#d0eeff', borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ width: `${Math.max(book.progress, 2)}%`, height: '100%', backgroundColor: BRAND, borderRadius: 3 }} />
        </View>
        <Text style={{ fontSize: 11, color: '#655356' }}>{book.progress}% read</Text>
      </View>
    </View>
  </View>
));
ReadingBookCard.displayName = 'ReadingBookCard';

// ─── Finished book tile ───────────────────────────────────────────────────────

const FinishedBookTile = memo(({ book }: { book: UserPublicBook }) => (
  <View style={{ width: 96, gap: 7 }}>
    {book.coverImage ? (
      <Image
        resizeMode="cover"
        source={{ uri: book.coverImage }}
        style={{ width: 96, height: 138, borderRadius: 10, backgroundColor: '#e2f5ff' }}
      />
    ) : (
      <View style={{ width: 96, height: 138, borderRadius: 10, backgroundColor: '#e2f5ff', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons color="#655356" name="book-outline" size={28} />
      </View>
    )}
    <Text numberOfLines={2} style={{ fontSize: 11, color: '#28231c', fontWeight: '500', lineHeight: 15 }}>
      {book.title}
    </Text>
    {book.myRating != null && (
      <View style={{ flexDirection: 'row', gap: 1 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={{ fontSize: 10, color: i <= book.myRating! ? '#F5A623' : '#e0dbd9' }}>★</Text>
        ))}
      </View>
    )}
  </View>
));
FinishedBookTile.displayName = 'FinishedBookTile';

// ─── Main screen ──────────────────────────────────────────────────────────────

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
    .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''))
    .slice(0, 12);

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
      <View style={{ flex: 1, backgroundColor: '#F8F6F4', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#28231c" />
      </View>
    );
  }

  const displayName = profile?.displayName ?? 'Reader';
  const firstName = displayName.split(' ')[0] ?? displayName;
  const avatarUrl = profile?.avatarUrl ?? null;
  const bio = profile?.bio ?? null;
  const isOwnProfile = currentUserId === userId;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#F8F6F4' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Top bar ────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 }}>
          <Pressable
            hitSlop={12}
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons color="#28231c" name="chevron-back" size={26} />
          </Pressable>
          {!isOwnProfile && (
            <Pressable
              hitSlop={12}
              onPress={() => router.push(`/chat/${userId}` as any)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Ionicons color="#28231c" name="chatbubble-outline" size={22} />
            </Pressable>
          )}
        </View>

        {/* ── Avatar ─────────────────────────────────────────────────── */}
        <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 14 }}>
          <View style={{ borderWidth: 3, borderColor: BRAND, borderRadius: 64, padding: 3 }}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: '#e2f5ff' }}
              />
            ) : (
              <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: '#e2f5ff', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 36, fontWeight: '700', color: '#28231c' }}>
                  {initials(displayName)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Name ───────────────────────────────────────────────────── */}
        <View style={{ alignItems: 'center', paddingBottom: 20, gap: 4, paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#28231c', letterSpacing: -0.4, textAlign: 'center' }}>
            {displayName}
          </Text>
        </View>

        {/* ── Stat boxes ─────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 16 }}>
          <View style={{ ...CARD, flex: 1, paddingVertical: 14, alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#28231c' }}>
              {profile?.followersCount ?? 0}
            </Text>
            <Text style={{ fontSize: 12, color: '#655356' }}>followers</Text>
          </View>
          <View style={{ ...CARD, flex: 1, paddingVertical: 14, alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#28231c' }}>
              {profile?.followingCount ?? 0}
            </Text>
            <Text style={{ fontSize: 12, color: '#655356' }}>following</Text>
          </View>
        </View>

        {/* ── Follow button ───────────────────────────────────────────── */}
        {!isOwnProfile && (
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Pressable
              disabled={toggling}
              onPress={() => void handleToggleFollow()}
              style={({ pressed }) => ({
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: 'center',
                backgroundColor: BRAND,
                opacity: toggling || pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#070707' }}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── About card ─────────────────────────────────────────────── */}
        <View style={{ ...CARD, marginHorizontal: 20, marginBottom: 12, padding: 18, minHeight: 90 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#28231c', marginBottom: 10 }}>
            About {firstName}
          </Text>
          {bio ? (
            <Text style={{ fontSize: 14, color: '#28231c', lineHeight: 22 }}>{bio}</Text>
          ) : (
            <Text style={{ fontSize: 13, color: '#c0b8b8' }}>No bio yet.</Text>
          )}
        </View>

        {/* ── Favourite genres card ───────────────────────────────────── */}
        <View style={{ ...CARD, marginHorizontal: 20, marginBottom: 20, padding: 18, minHeight: 80 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#28231c', marginBottom: 10 }}>
            Favourite genres
          </Text>
          {(profile as any)?.preferredGenres?.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {((profile as any).preferredGenres as string[]).map((g: string) => (
                <View key={g} style={{ backgroundColor: '#e2f5ff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 12, color: '#655356', fontWeight: '500' }}>{g}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 13, color: '#c0b8b8' }}>No genres selected yet.</Text>
          )}
        </View>

        {/* ── Books sections ──────────────────────────────────────────── */}
        {booksLoading ? (
          <ActivityIndicator color="#513b3c" style={{ marginTop: 16 }} />
        ) : (
          <>
            {currentlyReading.length > 0 && (
              <View style={{ ...CARD, marginHorizontal: 20, marginBottom: 12, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e0dbd5' }}>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#28231c' }}>
                    Currently Reading
                  </Text>
                  <View style={{ backgroundColor: '#e2f5ff', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#28231c' }}>{currentlyReading.length}</Text>
                  </View>
                </View>
                <View style={{ padding: 14, gap: 14 }}>
                  {currentlyReading.map((book, i) => (
                    <View key={book.bookApiId}>
                      {i > 0 && <View style={{ height: 1, backgroundColor: '#e0dbd5', marginBottom: 14 }} />}
                      <ReadingBookCard book={book} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {recentlyFinished.length > 0 && (
              <View style={{ ...CARD, marginHorizontal: 20, marginBottom: 12, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e0dbd5' }}>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#28231c' }}>
                    Recently Finished
                  </Text>
                  <View style={{ backgroundColor: '#e2f5ff', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#28231c' }}>{recentlyFinished.length}</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, padding: 14 }}
                >
                  {recentlyFinished.map((book) => (
                    <FinishedBookTile key={book.bookApiId} book={book} />
                  ))}
                </ScrollView>
              </View>
            )}

            {!currentlyReading.length && !recentlyFinished.length && (
              <View style={{ alignItems: 'center', paddingTop: 32, gap: 10 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#e2f5ff', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons color="#655356" name="book-outline" size={28} />
                </View>
                <Text style={{ color: '#655356', fontSize: 14 }}>No books shared yet</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

UserProfileScreen.displayName = 'UserProfileScreen';
