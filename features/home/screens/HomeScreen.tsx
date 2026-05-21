import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  Avatar,
  BookCard,
  Button,
  Card,
  Container,
  ProgressRing,
  Screen,
  Text,
} from '@/components';
import { getChallengeProgress } from '@/entities/challenge';
import { getInitials } from '@/entities/user';
import { useNytBestsellers } from '@/features/discover/hooks/useNytBestsellers';
import { useCustomShelves } from '@/features/library/hooks/useCustomShelves';
import { useLibrarySections } from '@/features/library/hooks/useLibrarySections';
import { WhatToReadNextCard } from '@/features/library/components/WhatToReadNextCard';
import { useAuthStore } from '@/store/authStore';
import { useChallengeStore } from '@/store/challengeStore';
import { useProfileStore } from '@/store/profileStore';
import type { Book } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bookHref = (id: string, tab?: string) =>
  (tab ? `/book/${id}?tab=${tab}` : `/book/${id}`) as any;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StarRating = memo(({ rating }: { rating: number }) => (
  <View className="flex-row items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        color={star <= Math.round(rating) ? '#F5A623' : '#D9D9D9'}
        name="star"
        size={12}
      />
    ))}
    <Text className="text-[12px] text-[#6d6d6d]" variant="caption">
      {rating.toFixed(1)}
    </Text>
  </View>
));
StarRating.displayName = 'StarRating';

const NowReadingCard = memo(
  ({ book, onPress }: { book: Book; onPress: () => void }) => {
    const coverSource = useMemo(() => ({ uri: book.coverImage }), [book.coverImage]);
    return (
      <Card className="overflow-hidden rounded-[20px] border-[#e8e8e8] bg-[#f9f9f9] p-0">
        <View className="flex-row gap-4 p-4">
          <Image
            className="h-[130px] w-[90px] rounded-[14px] bg-[#e0e0e0]"
            source={coverSource}
          />
          <View className="flex-1 justify-center gap-2">
            <Text
              className="text-[15px] font-semibold leading-[20px] text-black"
              numberOfLines={2}
              variant="body"
            >
              {book.title}
            </Text>
            <Text className="text-[13px] text-[#6d6d6d]" variant="caption">
              {book.author}
            </Text>
            <StarRating rating={book.rating} />
            <View className="mt-1 gap-1">
              <View className="h-[6px] overflow-hidden rounded-full bg-[#e5e5e5]">
                <View
                  className="h-full rounded-full bg-[#797DEA]"
                  style={{ width: `${book.progress}%` }}
                />
              </View>
              <Text className="text-[11px] text-[#9b9b9b]" variant="caption">
                {book.progress}% ·{' '}
                {Math.round((book.progress / 100) * (book.pages ?? 0))}/
                {book.pages ?? 0} pages
              </Text>
            </View>
          </View>
        </View>
        <View className="px-4 pb-4">
          <Button label="Continue reading" onPress={onPress} />
        </View>
      </Card>
    );
  },
);
NowReadingCard.displayName = 'NowReadingCard';

const ChallengeStrip = memo(({ onPress }: { onPress: () => void }) => {
  const challenge = useChallengeStore((s) => s.challenge);
  const progress = getChallengeProgress(challenge);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card className="rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-5 py-4">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-[13px] text-[#6d6d6d]" variant="caption">
              {challenge.year} Reading Challenge
            </Text>
            <Text className="text-[22px] font-semibold text-[#797DEA]" variant="body">
              {challenge.completed}/{challenge.goal} books
            </Text>
            <Text className="text-[13px] text-black" variant="caption">
              {challenge.label}
            </Text>
          </View>
          <ProgressRing
            progress={progress}
            progressColor="#CC76D8"
            size={72}
            strokeWidth={10}
            textClassName="text-[#313C5D]"
            trackColor="#797DEA"
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
});
ChallengeStrip.displayName = 'ChallengeStrip';

// ─── Main screen ───────────────────────────────────────────────────────────────

export const HomeScreen = memo(() => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { keepReading = [], wantToRead = [], finished = [], isFetching } = useLibrarySections();
  const { data: picks = [] } = useNytBestsellers();
  const { data: customShelves = [] } = useCustomShelves(user?.id ?? null);
  const widgets = useProfileStore((s) => s.homeWidgets);
  const { width: screenWidth } = useWindowDimensions();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const initials = user ? getInitials(user) : '?';
  const CARD_WIDTH = screenWidth - 40;
  const CARD_GAP = 12;
  const [activeIndex, setActiveIndex] = useState(0);

  const renderWidget = useCallback(
    (id: string) => {
      switch (id) {
        case 'currentlyReading':
          return isFetching ? (
            <ActivityIndicator key="cr-loading" color="#7851A9" />
          ) : keepReading.length > 0 ? (
            <View key="currentlyReading" className="gap-3">
              <Text className="text-[17px] font-semibold text-black" variant="body">
                Now Reading
              </Text>
              <ScrollView
                className="-mx-5"
                contentContainerStyle={{ gap: CARD_GAP, paddingHorizontal: 20 }}
                decelerationRate="fast"
                horizontal
                onMomentumScrollEnd={(e) => {
                  setActiveIndex(
                    Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP)),
                  );
                }}
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_GAP}
              >
                {keepReading.map((book) => (
                  <View key={book.id} style={{ width: CARD_WIDTH }}>
                    <NowReadingCard
                      book={book}
                      onPress={() => router.push(bookHref(book.id, 'my-reading'))}
                    />
                  </View>
                ))}
              </ScrollView>
              {keepReading.length > 1 && (
                <View className="flex-row justify-center gap-1.5">
                  {keepReading.map((_, i) => (
                    <View
                      key={i}
                      className="rounded-full"
                      style={{
                        backgroundColor: i === activeIndex ? '#797DEA' : '#d9d9d9',
                        height: 6,
                        width: i === activeIndex ? 16 : 6,
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Card key="cr-empty" className="items-center gap-3 rounded-[20px] border-[#e8e8e8] bg-[#f9f9f9] py-8">
              <Ionicons color="#c0c0c0" name="book-outline" size={40} />
              <Text className="text-center text-[15px] text-[#9b9b9b]" variant="body">
                No books in progress.{'\n'}Head to Discover to find your next read.
              </Text>
            </Card>
          );

        case 'whatToReadNext':
          return <WhatToReadNextCard key="whatToReadNext" wantToRead={wantToRead} />;

        case 'tbrShelf':
          return wantToRead.length > 0 ? (
            <View key="tbrShelf" className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[17px] font-semibold text-black" variant="body">TBR</Text>
                <Pressable onPress={() => router.push('/shelf/want-to-read' as any)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                  <Text className="text-[13px] text-[#797DEA]" variant="body">See all</Text>
                </Pressable>
              </View>
              <ScrollView className="-mx-5" contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }} horizontal showsHorizontalScrollIndicator={false}>
                {wantToRead.slice(0, 12).map((book) => (
                  <BookCard key={book.id} book={book} onPress={() => router.push(bookHref(book.id))} variant="compact" />
                ))}
              </ScrollView>
            </View>
          ) : null;

        case 'finished':
          return finished.length > 0 ? (
            <View key="finished" className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[17px] font-semibold text-black" variant="body">Finished</Text>
                <Pressable onPress={() => router.push('/shelf/completed' as any)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                  <Text className="text-[13px] text-[#797DEA]" variant="body">See all</Text>
                </Pressable>
              </View>
              <ScrollView className="-mx-5" contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }} horizontal showsHorizontalScrollIndicator={false}>
                {finished.slice(0, 12).map((book) => (
                  <BookCard key={book.id} book={book} onPress={() => router.push(bookHref(book.id))} variant="compact" />
                ))}
              </ScrollView>
            </View>
          ) : null;

        case 'readingChallenge':
          return <ChallengeStrip key="readingChallenge" onPress={() => router.push('/challenge' as any)} />;

        case 'customShelves':
          return customShelves.length > 0 ? (
            <View key="customShelves" className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[17px] font-semibold text-black" variant="body">My Shelves</Text>
                <Pressable onPress={() => router.push('/(tabs)/library' as any)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                  <Text className="text-[13px] text-[#797DEA]" variant="body">See all</Text>
                </Pressable>
              </View>
              {customShelves.slice(0, 4).map((shelf) => (
                <Pressable key={shelf.id} onPress={() => router.push(`/custom-shelf/${shelf.id}` as any)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
                  <Card className="flex-row items-center rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-5 py-4">
                    <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-[#ede9f7]">
                      <Ionicons color="#797DEA" name="bookmark-outline" size={16} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-medium text-black" variant="body">{shelf.name}</Text>
                      <Text className="text-[12px] text-[#9b9b9b]" variant="body">{shelf.bookCount} book{shelf.bookCount !== 1 ? 's' : ''}</Text>
                    </View>
                    <Ionicons color="#c0c0c0" name="chevron-forward" size={16} />
                  </Card>
                </Pressable>
              ))}
            </View>
          ) : null;

        default:
          return null;
      }
    },
    [router, keepReading, wantToRead, finished, customShelves, isFetching, activeIndex, CARD_WIDTH, CARD_GAP],
  );

  return (
    <Screen className="bg-[#fdfdfd]" contentClassName="gap-6 pt-2" scrollable>
      <Container className="gap-6 pb-6">

        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Ionicons color="#6d6d6d" name="notifications-outline" size={28} />
          <Avatar fallback={initials} size="sm" uri={user?.avatarUrl} />
        </View>

        {/* Greeting */}
        <View className="gap-1">
          <Text className="text-[14px] text-[#6d6d6d]" variant="caption">
            {getGreeting()},
          </Text>
          <Text className="text-[30px] font-semibold text-black" variant="display">
            {firstName} 👋
          </Text>
        </View>

        {/* Widgets in user-defined order */}
        {widgets.filter((w) => w.enabled).map((w) => renderWidget(w.id))}

        {/* Picks for you — always shown, not reorderable */}
        {picks.length > 0 && (
          <View className="gap-3">
            <Text className="text-[17px] font-semibold text-black" variant="body">
              Picks for you
            </Text>
            <ScrollView
              className="-mx-5"
              contentContainerClassName="gap-3 px-5"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {picks.slice(0, 10).map((book) => (
                <BookCard key={book.id} book={book} onPress={() => router.push(bookHref(book.id))} variant="compact" />
              ))}
            </ScrollView>
          </View>
        )}

      </Container>
    </Screen>
  );
});

HomeScreen.displayName = 'HomeScreen';
