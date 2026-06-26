import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { useLibrarySections } from '@/features/library/hooks/useLibrarySections';
import { useLiveChallenge } from '@/features/library/hooks/useLiveChallenge';
import { useRandomQuote } from '@/features/library/hooks/useRandomQuote';
import { useStreak } from '@/features/profile/hooks/useStreak';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import type { Book } from '@/types';

const bookHref = (id: string, tab?: string) =>
  (tab ? `/book/${id}?tab=${tab}` : `/book/${id}`) as any;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StarRating = memo(({ rating }: { rating: number }) => {
  if (!rating) {
    return (
      <View style={{ alignSelf: 'flex-start', backgroundColor: '#f0ece8', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ fontSize: 10, color: '#a09090' }}>No reviews yet</Text>
      </View>
    );
  }
  return (
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
  );
});
StarRating.displayName = 'StarRating';

const NowReadingCard = memo(
  ({ book, onPress }: { book: Book; onPress: () => void }) => {
    const coverSource = useMemo(
      () => ({ uri: book.coverImage }),
      [book.coverImage],
    );
    return (
      <Card className="overflow-hidden rounded-[20px] border-[#e8e8e8] bg-[#f5f2ee] p-0">
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
                  className="h-full rounded-full bg-[#c1eeff]"
                  style={{ width: `${book.progress}%` }}
                />
              </View>
              <Text className="text-[11px] text-[#655356]" variant="caption">
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
  const { challenge } = useLiveChallenge();
  const progress = getChallengeProgress(challenge);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card className="rounded-[17px] border-[#d9d9d9] bg-[#f5f2ee] px-5 py-4">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-[13px] text-[#6d6d6d]" variant="caption">
              {challenge.year} Reading Challenge
            </Text>
            <Text
              className="text-[22px] font-semibold text-[#655356]"
              variant="body"
            >
              {challenge.completed}/{challenge.goal} books
            </Text>
            <Text className="text-[13px] text-black" variant="caption">
              {challenge.label}
            </Text>
          </View>
          <ProgressRing
            progress={progress}
            progressColor="#c1eeff"
            size={72}
            strokeWidth={10}
            textClassName="text-[#28231c]"
            trackColor="#655356"
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
  const {
    dnf = [],
    keepReading = [],
    wantToRead = [],
    finished = [],
    isFetching,
  } = useLibrarySections();
  const { data: picks = [] } = useNytBestsellers();
  const { data: streakData } = useStreak(user?.id ?? null);
  const { data: randomQuote } = useRandomQuote(user?.id ?? null);
  const widgets = useProfileStore((s) => s.homeWidgets);
  const { width: screenWidth } = useWindowDimensions();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const initials = user ? getInitials(user) : '?';
  const CARD_WIDTH = screenWidth - 40;
  const CARD_GAP = 12;
  const [activeIndex, setActiveIndex] = useState(0);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'currentlyReading':
        return isFetching ? (
          <ActivityIndicator key="cr-loading" color="#655356" />
        ) : keepReading.length > 0 ? (
          <View key="currentlyReading" className="gap-3">
            <View className="gap-0.5">
              <Text className="text-[17px] font-semibold text-black" variant="body">
                Now Reading
              </Text>
              <Text className="text-[12px] text-[#655356]" variant="body">
                Pick up where you left off
              </Text>
            </View>
            <ScrollView
              className="-mx-5"
              contentContainerStyle={{ gap: CARD_GAP, paddingHorizontal: 20 }}
              decelerationRate="fast"
              horizontal
              onMomentumScrollEnd={(e) => {
                setActiveIndex(
                  Math.round(
                    e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP),
                  ),
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
                      backgroundColor:
                        i === activeIndex ? '#c1eeff' : '#ddd9d3',
                      height: 6,
                      width: i === activeIndex ? 16 : 6,
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <Card
            key="cr-empty"
            className="items-center gap-3 rounded-[20px] border-[#e8e8e8] bg-[#f5f2ee] py-8"
          >
            <Ionicons color="#c0c0c0" name="book-outline" size={40} />
            <Text
              className="text-center text-[15px] text-[#655356]"
              variant="body"
            >
              No books in progress.{'\n'}Head to Discover to find your next
              read.
            </Text>
          </Card>
        );

      case 'readingChallenge':
        return (
          <View key="readingChallenge" className="gap-3">
            <View className="gap-0.5">
              <Text className="text-[17px] font-semibold text-black" variant="body">
                Reading Challenge
              </Text>
              <Text className="text-[12px] text-[#655356]" variant="body">
                Track your yearly reading goal
              </Text>
            </View>
            <ChallengeStrip onPress={() => router.push('/challenge' as any)} />
          </View>
        );

      case 'streak': {
        const current = streakData?.current ?? 0;
        const best = streakData?.best ?? 0;
        return (
          <View key="streak" className="gap-3">
            <View className="gap-0.5">
              <Text className="text-[17px] font-semibold text-black" variant="body">
                Reading Streak
              </Text>
              <Text className="text-[12px] text-[#655356]" variant="body">
                Keep the momentum going every day
              </Text>
            </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/challenge' as any)}
          >
            <Card className="rounded-[17px] border-[#d9d9d9] bg-[#f5f2ee] px-5 py-4">
              <View className="flex-row items-center justify-between">
                <View className="gap-1">
                  <View className="flex-row items-end gap-1.5">
                    <Text
                      className="text-[28px] font-semibold text-[#655356]"
                      variant="body"
                    >
                      {current}
                    </Text>
                    <Text
                      className="pb-0.5 text-[14px] text-[#655356]"
                      variant="caption"
                    >
                      {current === 1 ? 'day' : 'days'}
                    </Text>
                  </View>
                  {best > 0 && (
                    <Text
                      className="text-[12px] text-[#655356]"
                      variant="caption"
                    >
                      Best: {best} {best === 1 ? 'day' : 'days'}
                    </Text>
                  )}
                </View>
                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#e2f5ff]">
                  <Text className="text-[28px]" variant="body">
                    🔥
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
          </View>
        );
      }

      case 'quoteOfTheDay': {
        if (!randomQuote) return null;
        const allBooks = [...keepReading, ...wantToRead, ...finished, ...dnf];
        const quoteBook = allBooks.find((b) => b.id === randomQuote.bookApiId);
        return (
          <View key="quoteOfTheDay" className="gap-3">
            <View className="gap-0.5">
              <Text className="text-[17px] font-semibold text-black" variant="body">
                Quote of the day
              </Text>
              <Text className="text-[12px] text-[#655356]" variant="body">
                A highlight from your reading journey
              </Text>
            </View>
            <Card className="rounded-[17px] border-[#e8e8e8] bg-[#f5f2ee] px-5 py-4 gap-3">
              <Text className="text-[32px] leading-none text-[#655356]" variant="body">"</Text>
              <Text
                className="text-[14px] leading-[22px] text-[#28231c]"
                numberOfLines={6}
                variant="body"
              >
                {randomQuote.text}
              </Text>
              {quoteBook && (
                <Text className="text-[12px] text-[#655356]" variant="body">
                  — {quoteBook.title}
                </Text>
              )}
            </Card>
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Screen className="bg-[#F8F6F4]" contentClassName="gap-6 pt-2" scrollable>
      <Container className="gap-6 pb-6">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Ionicons color="#655356" name="notifications-outline" size={28} />
          <Avatar fallback={initials} size="sm" uri={user?.avatarUrl} />
        </View>

        {/* Greeting */}
        <View className="gap-1">
          <Text className="text-[14px] text-[#6d6d6d]" variant="caption">
            {getGreeting()},
          </Text>
          <Text
            className="text-[30px] font-semibold text-black"
            variant="display"
          >
            {firstName} 👋
          </Text>
        </View>

        {/* Widgets in user-defined order */}
        {widgets.filter((w) => w.enabled).map((w) => renderWidget(w.id))}

        {/* Picks for you — always shown, not reorderable */}
        {picks.length > 0 && (
          <View className="gap-3">
            <View className="gap-0.5">
              <Text className="text-[17px] font-semibold text-black" variant="body">
                Picks for you
              </Text>
              <Text className="text-[12px] text-[#655356]" variant="body">
                Books handpicked based on what you enjoy
              </Text>
            </View>
            <ScrollView
              className="-mx-5"
              contentContainerClassName="gap-3 px-5"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {picks.slice(0, 10).map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onPress={() => router.push(bookHref(book.id))}
                  variant="compact"
                />
              ))}
            </ScrollView>
          </View>
        )}
      </Container>
    </Screen>
  );
});

HomeScreen.displayName = 'HomeScreen';
