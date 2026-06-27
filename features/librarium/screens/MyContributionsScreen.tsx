import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { Text } from '@/components/atoms/Text';
import { getMyLibrariumSubmissions } from '@/services/books/communityBooks';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/types';
import { LIBRARIAN_TIERS, MARKS_PER_APPROVAL } from '../constants';

type FilterTab = 'all' | 'pending' | 'approved' | 'needs_revision';

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'needs_revision', label: 'Needs revision' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getCurrentTier(approvedCount: number) {
  let current = null;
  let next = null;

  for (let i = LIBRARIAN_TIERS.length - 1; i >= 0; i--) {
    const tier = LIBRARIAN_TIERS[i];
    if (tier && approvedCount >= tier.min) {
      current = tier;
      next = i + 1 < LIBRARIAN_TIERS.length ? (LIBRARIAN_TIERS[i + 1] ?? null) : null;
      break;
    }
  }

  if (!current) {
    next = LIBRARIAN_TIERS[0];
  }

  return { current, next };
}

function StatusBadge({ status }: { status: string | undefined }) {
  if (!status || status === 'verified') {
    return (
      <View
        className="self-start rounded-full px-2 py-0.5"
        style={{ backgroundColor: '#dcfce7' }}
      >
        <Text style={{ color: '#15803d', fontSize: 11, fontWeight: '600' }}>Approved</Text>
      </View>
    );
  }
  if (status === 'pending') {
    return (
      <View
        className="self-start rounded-full px-2 py-0.5"
        style={{ backgroundColor: '#fef9c3' }}
      >
        <Text style={{ color: '#92400e', fontSize: 11, fontWeight: '600' }}>Pending</Text>
      </View>
    );
  }
  if (status === 'needs_revision') {
    return (
      <View
        className="self-start rounded-full px-2 py-0.5"
        style={{ backgroundColor: '#fee2e2' }}
      >
        <Text style={{ color: '#b91c1c', fontSize: 11, fontWeight: '600' }}>Needs revision</Text>
      </View>
    );
  }
  return null;
}

function BookRow({ book }: { book: Book }) {
  const status = book.librariumStatus;
  const isApproved = !status || status === 'verified';
  const isRevision = status === 'needs_revision';

  const handlePress = () => {
    if (isApproved) {
      router.push(`/book/${book.id}` as any);
    } else if (isRevision && book.librariumRejectionReason) {
      Alert.alert('Needs revision', book.librariumRejectionReason, [
        { text: 'OK' },
        {
          text: 'Fix and resubmit',
          onPress: () => router.push('/librarium/submit' as any),
        },
      ]);
    }
  };

  return (
    <Pressable
      className="flex-row gap-3 py-3"
      disabled={!isApproved && !isRevision}
      onPress={handlePress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {/* Cover */}
      {book.coverImage ? (
        <Image
          resizeMode="cover"
          source={{ uri: book.coverImage }}
          style={{ borderRadius: 4, height: 60, width: 40 }}
        />
      ) : (
        <View
          className="items-center justify-center rounded"
          style={{ backgroundColor: '#e2f5ff', height: 60, width: 40 }}
        >
          <Ionicons color="#655356" name="book-outline" size={18} />
        </View>
      )}

      {/* Info */}
      <View className="flex-1 gap-1">
        <Text className="text-[14px] font-semibold text-[#28231c]" numberOfLines={1}>
          {book.title}
        </Text>
        <Text className="text-[12px] text-[#655356]" numberOfLines={1}>
          {book.author}
        </Text>
        <StatusBadge status={status} />
        {isRevision && book.librariumRejectionReason && (
          <Text className="text-[11px] text-[#b91c1c]" numberOfLines={2}>
            {book.librariumRejectionReason}
          </Text>
        )}
      </View>

      {/* Right side */}
      <View className="items-end justify-between">
        {isApproved && (
          <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '600' }}>+150 Marks</Text>
        )}
        <Ionicons
          color={isApproved || isRevision ? '#28231c' : 'transparent'}
          name="chevron-forward"
          size={14}
        />
      </View>
    </Pressable>
  );
}

export function MyContributionsScreen() {
  const user = useAuthStore((s) => s.user);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  useEffect(() => {
    if (!user) return;
    getMyLibrariumSubmissions(user.id)
      .then(setBooks)
      .finally(() => setLoading(false));
  }, [user]);

  const approvedCount = books.filter(
    (b) => !b.librariumStatus || b.librariumStatus === 'verified',
  ).length;
  const pendingCount = books.filter((b) => b.librariumStatus === 'pending').length;
  const marksEarned = approvedCount * MARKS_PER_APPROVAL;

  const { current: currentTier, next: nextTier } = getCurrentTier(approvedCount);

  const filteredBooks = books.filter((b) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'approved') return !b.librariumStatus || b.librariumStatus === 'verified';
    return b.librariumStatus === activeFilter;
  });

  return (
    <View className="flex-1 bg-[#F8F6F4]">
      {/* Header */}
      <View
        className="flex-row items-center gap-3 border-b border-[#e0dbd5] bg-white px-4"
        style={{ paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 14 }}
      >
        <Pressable accessibilityLabel="Go back" hitSlop={12} onPress={() => router.back()}>
          <Ionicons color="#28231c" name="arrow-back" size={22} />
        </Pressable>
        <Text className="text-[17px] font-semibold text-[#28231c]">My Contributions</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#513b3c" size="large" />
        </View>
      ) : books.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          bounces={false}
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro copy */}
          <View className="mx-4 mt-4">
            <Text className="text-[15px] font-semibold leading-6 text-[#28231c]">
              Every book you add here is a book someone else will one day find.
            </Text>
            <Text className="text-[13px] leading-5 text-[#655356]">
              That's not nothing. That's the whole point.
            </Text>
          </View>

          {/* Stats strip */}
          <View className="mx-4 mt-4 flex-row gap-3">
            {[
              { label: 'Submitted', value: books.length },
              { label: 'Pending', value: pendingCount },
              { label: 'Approved', value: approvedCount },
              { label: 'Marks earned', value: marksEarned },
            ].map((stat) => (
              <View
                key={stat.label}
                className="flex-1 items-center rounded-2xl bg-white py-3"
                style={{ borderColor: '#e0dbd5', borderWidth: 1 }}
              >
                <Text className="text-[18px] font-bold text-[#28231c]">{stat.value}</Text>
                <Text className="mt-0.5 text-center text-[10px] text-[#655356]">{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Badge progress card */}
          <View
            className="mx-4 mt-3 rounded-2xl bg-white p-4"
            style={{ borderColor: '#e0dbd5', borderWidth: 1 }}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-[22px]">
                {currentTier ? currentTier.emoji : nextTier?.emoji ?? '📚'}
              </Text>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-[#28231c]">
                  {currentTier ? currentTier.name : 'Not yet a Librarian'}
                </Text>
                {nextTier && (
                  <Text className="text-[12px] text-[#655356]">
                    {approvedCount} / {nextTier.min} approved · Next: {nextTier.name}
                  </Text>
                )}
                {!nextTier && currentTier && (
                  <Text className="text-[12px] text-[#655356]">
                    {approvedCount} books approved · Master Librarian
                  </Text>
                )}
              </View>
            </View>

            {/* Progress bar */}
            {nextTier && (
              <View
                className="mt-3 overflow-hidden rounded-full"
                style={{ backgroundColor: '#e2f5ff', height: 6 }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: '#c1eeff',
                    width: `${Math.min(100, (approvedCount / nextTier.min) * 100)}%`,
                  }}
                />
              </View>
            )}

            {nextTier && (
              <Text className="mt-1.5 text-[11px] text-[#655356]">
                +{nextTier.bonus} Leaves bonus on unlock
              </Text>
            )}
          </View>

          {/* Filter tabs */}
          <ScrollView
            className="mt-4"
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {FILTER_TABS.map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  className="rounded-full px-4 py-1.5"
                  onPress={() => setActiveFilter(tab.id)}
                  style={{ backgroundColor: active ? '#c1eeff' : '#e2f5ff' }}
                >
                  <Text
                    className="text-[13px] font-medium"
                    style={{ color: active ? '#070707' : '#655356' }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Book list */}
          <View className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white" style={{ borderColor: '#e0dbd5', borderWidth: 1 }}>
            {filteredBooks.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-[14px] text-[#655356]">No books in this category.</Text>
              </View>
            ) : (
              filteredBooks.map((book, index) => (
                <View key={book.id}>
                  {index > 0 && (
                    <View className="mx-4 border-t border-[#f0ebe6]" />
                  )}
                  <View className="px-4">
                    <BookRow book={book} />
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <Text className="text-[40px]">📚</Text>
      <Text className="text-center text-[16px] font-semibold text-[#28231c]">
        The Librarium grows one book at a time.
      </Text>
      <Text className="text-center text-[14px] leading-5 text-[#655356]">
        If you've ever searched for a book and not found it, that's where to start.
      </Text>
      <Pressable
        className="mt-2 rounded-full px-6 py-3"
        onPress={() => router.push('/librarium/submit' as any)}
        style={{ backgroundColor: '#c1eeff' }}
      >
        <Text className="text-[15px] font-semibold text-[#070707]">+ Add your first book</Text>
      </Pressable>
    </View>
  );
}
