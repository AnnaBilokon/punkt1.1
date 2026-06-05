import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useBookStore } from '@/store/bookStore';
import { useProfileStore } from '@/store/profileStore';
import type { Book } from '@/types';

const ITEM_HEIGHT = 72;
const BRAND = '#7851A9';

const HERO_MESSAGES = [
  "This book has been waiting since your last impulse buy at midnight.",
  "No new purchases until this one is done. (*not legally binding)",
  "Your TBR pile elected this as their spokesperson. Don't let them down.",
  "Put Bookshop.org down. Just this once. You can do it.",
  "Reading this is cheaper than therapy. And you already own it.",
  "Your reading chair has been reserved. Snacks optional but encouraged.",
  "This book forgives you for the 47 others you added first. Probably.",
];

const getPileQuip = (n: number): string => {
  if (n === 1) return "One book. No excuses. You've got this.";
  if (n <= 4) return "A focused stack. Suspicious, but we respect it.";
  if (n <= 8) return "Healthy ambition. You'll definitely get to all of these.";
  if (n <= 15) return "A majestic pile. Your future self has big plans.";
  if (n <= 30) return "Bold. Have you considered a reading sabbatical?";
  return "You have a problem. A beautiful, book-scented problem. 📚";
};

const getHeroMessage = (book: Book): string => {
  const hash = book.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return HERO_MESSAGES[hash % HERO_MESSAGES.length]!;
};

// ─── Hero card ─────────────────────────────────────────────────────────────────

const HeroCard = memo(({ book, onStartReading }: { book: Book; onStartReading: () => void }) => (
  <View
    style={{
      backgroundColor: '#f0ecfa',
      borderColor: '#ddd4f0',
      borderRadius: 20,
      borderWidth: 1,
      gap: 12,
      padding: 16,
    }}
  >
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 6 }}>
      <Text style={{ fontSize: 14 }} variant="body">⚡</Text>
      <Text className="text-[11px] font-semibold uppercase tracking-widest text-[#7851A9]" variant="caption">
        Up next
      </Text>
    </View>

    <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 14 }}>
      <Image
        style={{ backgroundColor: '#e0e0e0', borderRadius: 12, height: 120, width: 80 }}
        source={{ uri: book.coverImage }}
      />
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          className="text-[16px] font-semibold leading-[22px] text-black"
          numberOfLines={3}
          variant="body"
        >
          {book.title}
        </Text>
        <Text className="text-[13px] text-[#6d6d6d]" variant="caption">
          {book.author}
        </Text>
        <Text className="mt-2 text-[12px] italic text-[#9b9b9b]" variant="caption">
          {getHeroMessage(book)}
        </Text>
      </View>
    </View>

    <Button label="Start reading →" onPress={onStartReading} />
  </View>
));
HeroCard.displayName = 'HeroCard';

// ─── Drag row ──────────────────────────────────────────────────────────────────

const TBRRow = memo(
  ({
    activeIdx,
    book,
    count,
    dragY,
    hoverIdx,
    index,
    onCommitReorder,
    onDragEnd,
    onDragStart,
  }: {
    activeIdx: SharedValue<number>;
    book: Book;
    count: number;
    dragY: SharedValue<number>;
    hoverIdx: SharedValue<number>;
    index: number;
    onCommitReorder: (from: number, to: number) => void;
    onDragEnd: () => void;
    onDragStart: () => void;
  }) => {
    const gesture = Gesture.Pan()
      .activateAfterLongPress(200)
      .onStart(() => {
        activeIdx.value = index;
        hoverIdx.value = index;
        dragY.value = 0;
        runOnJS(onDragStart)();
      })
      .onUpdate((e) => {
        dragY.value = e.translationY;
        hoverIdx.value = Math.min(
          Math.max(0, Math.round(index + e.translationY / ITEM_HEIGHT)),
          count - 1,
        );
      })
      .onEnd(() => {
        const from = activeIdx.value;
        const to = hoverIdx.value;
        activeIdx.value = -1;
        hoverIdx.value = -1;
        dragY.value = withSpring(0, { damping: 20, stiffness: 300 });
        runOnJS(onDragEnd)();
        if (from !== -1 && from !== to) {
          runOnJS(onCommitReorder)(from, to);
        }
      });

    const animStyle = useAnimatedStyle(() => {
      const a = activeIdx.value;
      const h = hoverIdx.value;
      const isActive = a === index;

      if (isActive) {
        return {
          backgroundColor: '#fff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          transform: [{ translateY: dragY.value }, { scale: 1.02 }],
          zIndex: 100,
        };
      }

      let shift = 0;
      if (a !== -1) {
        if (a < h && index > a && index <= h) shift = -ITEM_HEIGHT;
        else if (a > h && index >= h && index < a) shift = ITEM_HEIGHT;
      }

      return {
        backgroundColor: index === 0 ? '#faf8ff' : '#fff',
        elevation: 0,
        shadowOpacity: 0,
        transform: [
          { translateY: withSpring(shift, { damping: 20, stiffness: 300 }) },
          { scale: 1 },
        ],
        zIndex: 0,
      };
    });

    const isFirst = index === 0;

    return (
      <Animated.View
        style={[
          {
            alignItems: 'center',
            borderBottomColor: '#f0f0f0',
            borderBottomWidth: 1,
            flexDirection: 'row',
            gap: 10,
            height: ITEM_HEIGHT,
            paddingHorizontal: 14,
          },
          animStyle,
        ]}
      >
        {/* Rank badge */}
        <View
          style={{
            alignItems: 'center',
            backgroundColor: isFirst ? '#ede9f7' : '#f5f5f5',
            borderRadius: 8,
            height: 28,
            justifyContent: 'center',
            width: 28,
          }}
        >
          <Text
            style={{
              color: isFirst ? BRAND : '#9b9b9b',
              fontSize: isFirst ? 14 : 11,
              fontWeight: '600',
            }}
            variant="body"
          >
            {isFirst ? '👑' : `${index + 1}`}
          </Text>
        </View>

        {/* Cover */}
        <Image
          style={{ backgroundColor: '#e0e0e0', borderRadius: 6, height: 52, width: 36 }}
          source={{ uri: book.coverImage }}
        />

        {/* Title + author */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            className="text-[13px] font-medium leading-[17px] text-black"
            numberOfLines={2}
            variant="body"
          >
            {book.title}
          </Text>
          <Text className="text-[11px] text-[#9b9b9b]" numberOfLines={1} variant="caption">
            {book.author}
          </Text>
        </View>

        {/* Drag handle */}
        <GestureDetector gesture={gesture}>
          <View style={{ padding: 8 }}>
            <Ionicons color="#c0c0c0" name="menu" size={20} />
          </View>
        </GestureDetector>
      </Animated.View>
    );
  },
);
TBRRow.displayName = 'TBRRow';

// ─── Screen ────────────────────────────────────────────────────────────────────

export const TBRScreen = memo(({ books }: { books: Book[] }) => {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const updateBookStatus = useBookStore((s) => s.updateBookStatus);
  const tbrOrder = useProfileStore((s) => s.tbrOrder);
  const setTbrOrder = useProfileStore((s) => s.setTbrOrder);
  const updateTbrOrder = useProfileStore((s) => s.updateTbrOrder);

  const sortedBooks = useMemo(() => {
    if (tbrOrder.length === 0) return books;
    const orderMap = new Map(tbrOrder.map((id, i) => [id, i]));
    return [...books].sort((a, b) => {
      const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : books.length;
      const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : books.length;
      return ai - bi;
    });
  }, [books, tbrOrder]);

  const [items, setItems] = useState(sortedBooks);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && sortedBooks.length > 0) {
      setItems(sortedBooks);
      initialized.current = true;
    }
  }, [sortedBooks]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const activeIdx = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const hoverIdx = useSharedValue(-1);

  const disableScroll = useCallback(() => {
    scrollRef.current?.setNativeProps({ scrollEnabled: false });
  }, []);

  const enableScroll = useCallback(() => {
    scrollRef.current?.setNativeProps({ scrollEnabled: true });
  }, []);

  const persist = useCallback(
    (next: Book[]) => {
      const ids = next.map((b) => b.id);
      setTbrOrder(ids);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (userId) void updateTbrOrder(userId, ids);
      }, 500);
    },
    [userId, setTbrOrder, updateTbrOrder],
  );

  const commitReorder = useCallback(
    (from: number, to: number) => {
      const next = [...itemsRef.current];
      const [moved] = next.splice(from, 1);
      if (moved) next.splice(to, 0, moved);
      setItems(next);
      persist(next);
    },
    [persist],
  );

  const handleStartReading = useCallback(async () => {
    const book = itemsRef.current[0];
    if (!book || !userId) return;
    await updateBookStatus(userId, book.id, 'reading');
    router.push(`/book/${book.id}?tab=my-reading` as any);
  }, [userId, updateBookStatus, router]);

  const heroBook = items[0] ?? null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ paddingBottom: 16, paddingTop: 8 }}>
            <Pressable
              style={({ pressed }) => ({
                alignItems: 'center',
                alignSelf: 'flex-start',
                flexDirection: 'row',
                gap: 4,
                marginBottom: 12,
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={() => router.back()}
            >
              <Ionicons color="#6d6d6d" name="chevron-back" size={20} />
              <Text className="text-[14px] text-[#6d6d6d]" variant="body">
                Library
              </Text>
            </Pressable>

            <View style={{ alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text className="text-[24px] font-bold text-black" variant="body">
                TBR
              </Text>
              <Text className="mb-0.5 text-[13px] text-[#9b9b9b]" variant="body">
                {books.length} book{books.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {books.length > 0 && (
              <Text className="mt-1 text-[13px] text-[#9b9b9b]" variant="caption">
                {getPileQuip(books.length)}
              </Text>
            )}
          </View>

          {books.length === 0 ? (
            <View style={{ alignItems: 'center', gap: 16, marginTop: 64 }}>
              <Ionicons color="#d0d0d0" name="bookmark-outline" size={52} />
              <Text className="text-center text-[15px] text-[#9b9b9b]" variant="body">
                Nothing here yet.{'\n'}Head to Discover to find your next read.
              </Text>
            </View>
          ) : (
            <>
              {heroBook && (
                <HeroCard book={heroBook} onStartReading={handleStartReading} />
              )}

              <View style={{ marginTop: 24 }}>
                <Text className="mb-2 text-[12px] text-[#9b9b9b]" variant="caption">
                  Hold ≡ to reprioritise
                </Text>
                <View
                  style={{
                    borderColor: '#e8e8e8',
                    borderRadius: 16,
                    borderWidth: 1,
                    overflow: 'visible',
                  }}
                >
                  {items.map((book, index) => (
                    <TBRRow
                      key={book.id}
                      activeIdx={activeIdx}
                      book={book}
                      count={items.length}
                      dragY={dragY}
                      hoverIdx={hoverIdx}
                      index={index}
                      onCommitReorder={commitReorder}
                      onDragEnd={enableScroll}
                      onDragStart={disableScroll}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
});

TBRScreen.displayName = 'TBRScreen';
