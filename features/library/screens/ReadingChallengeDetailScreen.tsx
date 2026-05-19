import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { Image, Modal, Pressable, TouchableOpacity, View } from 'react-native';

import {
  Button,
  Card,
  Container,
  ProgressRing,
  Screen,
  Text,
} from '@/components';
import { getChallengeProgress } from '@/entities/challenge';
import { useChallengeStore } from '@/store/challengeStore';
import type { Book } from '@/types';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const CURRENT_MONTH = new Date().getMonth() + 1;

const getStatusMessage = (progress: number) => {
  if (progress >= 100) return "You've crushed it! 🎉";
  if (progress >= 60) return "You're on track!";
  if (progress >= 40) return 'Keep going, you can do it!';
  return 'Every page counts. Keep reading!';
};

const getPaceInfo = (completed: number, goal: number) => {
  const remaining = Math.max(0, goal - completed);
  const monthsLeft = Math.max(1, 12 - CURRENT_MONTH + 1);
  const booksPerMonth = Math.ceil(remaining / monthsLeft);
  return { booksPerMonth, monthsLeft, remaining };
};

const StatCard = memo(({ label, value }: { label: string; value: string }) => (
  <Card className="flex-1 items-center gap-1 rounded-[14px] border-[#e8e8e8] bg-[#f9f9f9] py-4">
    <Text className="text-[18px] font-bold text-[#313C5D]" variant="body">
      {value}
    </Text>
    <Text className="text-center text-[11px] text-[#9b9b9b]" variant="caption">
      {label}
    </Text>
  </Card>
));
StatCard.displayName = 'StatCard';

const MonthBar = memo(
  ({
    count,
    isFuture,
    isSelected,
    label,
    maxCount,
    onPress,
  }: {
    count: number;
    isFuture: boolean;
    isSelected: boolean;
    label: string;
    maxCount: number;
    onPress: () => void;
  }) => {
    const BAR_MAX_HEIGHT = 60;
    const barHeight =
      maxCount > 0 ? Math.max(4, (count / maxCount) * BAR_MAX_HEIGHT) : 4;
    const barColor = isFuture ? '#f0f0f0' : isSelected ? '#797DEA' : '#d0d0e8';

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-1 items-center gap-1"
        onPress={onPress}
      >
        <Text className="text-[10px] text-[#9b9b9b]" variant="caption">
          {count > 0 ? count : ''}
        </Text>
        <View
          style={{
            height: BAR_MAX_HEIGHT,
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: barColor,
              borderRadius: 4,
              height: barHeight,
              width: 18,
            }}
          />
        </View>
        <Text
          className={`text-[9px] ${isSelected ? 'font-semibold text-[#797DEA]' : 'text-[#9b9b9b]'}`}
          variant="caption"
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  },
);
MonthBar.displayName = 'MonthBar';

const BookRow = memo(({ book }: { book: Book }) => {
  const coverSource = { uri: book.coverImage };
  return (
    <View className="flex-row items-center gap-3 py-2">
      <Image
        className="h-[60px] w-[42px] rounded-[8px] bg-[#e0e0e0]"
        source={coverSource}
      />
      <View className="flex-1 gap-0.5">
        <Text
          className="text-[14px] font-semibold text-black"
          numberOfLines={1}
          variant="body"
        >
          {book.title}
        </Text>
        <Text className="text-[12px] text-[#6d6d6d]" variant="caption">
          {book.author}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Ionicons
              key={s}
              color={
                s <= Math.round(book.myRating ?? book.rating)
                  ? '#F5A623'
                  : '#D9D9D9'
              }
              name="star"
              size={10}
            />
          ))}
          {book.pages ? (
            <Text className="ml-1 text-[10px] text-[#9b9b9b]" variant="caption">
              {book.pages} pages
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
});
BookRow.displayName = 'BookRow';

const EditGoalSheet = memo(
  ({
    currentGoal,
    onClose,
    onSave,
    visible,
  }: {
    currentGoal: number;
    onClose: () => void;
    onSave: (goal: number) => void;
    visible: boolean;
  }) => {
    const [value, setValue] = useState(currentGoal);

    return (
      <Modal
        animationType="slide"
        onRequestClose={onClose}
        transparent
        visible={visible}
      >
        <View className="flex-1 justify-end">
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
              Edit reading goal
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
                  onSave(value);
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

export const ReadingChallengeDetailScreen = memo(() => {
  const router = useRouter();
  const challenge = useChallengeStore((s) => s.challenge);
  const monthlyBooks = useChallengeStore((s) => s.monthlyBooks);
  const streak = useChallengeStore((s) => s.streak);
  const updateGoal = useChallengeStore((s) => s.updateGoal);

  const [selectedMonth, setSelectedMonth] = useState<number>(CURRENT_MONTH);
  const [editGoalVisible, setEditGoalVisible] = useState(false);

  const progress = getChallengeProgress(challenge);
  const { booksPerMonth, monthsLeft, remaining } = getPaceInfo(
    challenge.completed,
    challenge.goal,
  );
  const statusMessage = getStatusMessage(progress);

  const allCompletedBooks = Object.values(monthlyBooks).flat();

  const totalPages = allCompletedBooks.reduce(
    (sum, b) => sum + (b.pages ?? 0),
    0,
  );
  const ratedBooks = allCompletedBooks.filter((b) => b.myRating);
  const avgRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.myRating ?? 0), 0) /
        ratedBooks.length
      : 0;
  const bestMonthNum = Object.entries(monthlyBooks).reduce(
    (best, [month, books]) =>
      books.length > (monthlyBooks[Number(best)]?.length ?? 0) ? month : best,
    '1',
  );
  const bestMonthLabel = MONTHS[(Number(bestMonthNum) - 1) % 12] ?? '—';

  const monthlyCounts = MONTHS.map((_, i) => monthlyBooks[i + 1]?.length ?? 0);
  const maxCount = Math.max(...monthlyCounts, 1);

  const selectedBooks = monthlyBooks[selectedMonth] ?? [];
  const placeholderCount = Math.max(0, challenge.goal - challenge.completed);

  return (
    <Screen className="bg-[#fdfdfd]" contentClassName="gap-6 pt-2" scrollable>
      <Container className="gap-6 pb-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center gap-1"
            onPress={() => router.back()}
          >
            <Ionicons color="#6d6d6d" name="chevron-back" size={20} />
            <Text className="text-[14px] text-[#6d6d6d]" variant="body">
              Library
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setEditGoalVisible(true)}
          >
            <Text
              className="text-[14px] font-medium text-[#797DEA]"
              variant="body"
            >
              Edit goal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View
          className="items-center gap-4 overflow-hidden rounded-[24px] p-6"
          style={{ backgroundColor: '#797DEA' }}
        >
          <ProgressRing
            progress={progress}
            progressColor="#CC76D8"
            size={160}
            strokeWidth={16}
            textClassName="text-white"
            trackColor="rgba(255,255,255,0.25)"
          />
          <Text className="text-[28px] font-bold text-white" variant="display">
            {challenge.completed}/{challenge.goal} books
          </Text>
          <Text
            className="text-center text-[14px] text-white/80"
            variant="body"
          >
            ~{booksPerMonth} book{booksPerMonth !== 1 ? 's' : ''}/month ·{' '}
            {remaining} book{remaining !== 1 ? 's' : ''} left · {monthsLeft}{' '}
            month{monthsLeft !== 1 ? 's' : ''} to go
          </Text>
          <View className="rounded-full bg-white/20 px-4 py-1.5">
            <Text className="text-[13px] font-medium text-white" variant="body">
              {statusMessage}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row gap-3">
          <StatCard
            label="Pages read"
            value={totalPages > 0 ? totalPages.toLocaleString() : '—'}
          />
          <StatCard
            label="Avg rating"
            value={avgRating > 0 ? avgRating.toFixed(1) : '—'}
          />
          <StatCard label="Best month" value={bestMonthLabel} />
        </View>

        {/* Monthly bar chart */}
        <Card className="gap-3 rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] p-4">
          <Text className="text-[15px] font-semibold text-black" variant="body">
            Monthly progress
          </Text>
          <View className="flex-row items-end">
            {MONTHS.map((label, i) => {
              const month = i + 1;
              return (
                <MonthBar
                  key={label}
                  count={monthlyCounts[i] ?? 0}
                  isFuture={month > CURRENT_MONTH}
                  isSelected={selectedMonth === month}
                  label={label}
                  maxCount={maxCount}
                  onPress={() => setSelectedMonth(month)}
                />
              );
            })}
          </View>
        </Card>

        {/* Books in selected month */}
        <View className="gap-3">
          <Text className="text-[15px] font-semibold text-black" variant="body">
            {MONTHS[(selectedMonth - 1) % 12] ?? ''} {challenge.year}
          </Text>
          {selectedBooks.length > 0 ? (
            <Card className="rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-4 py-2">
              {selectedBooks.map((book, idx) => (
                <View key={book.id}>
                  <BookRow book={book} />
                  {idx < selectedBooks.length - 1 && (
                    <View className="h-[1px] bg-[#e8e8e8]" />
                  )}
                </View>
              ))}
            </Card>
          ) : (
            <Card className="items-center rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] py-6">
              <Text className="text-[14px] text-[#9b9b9b]" variant="body">
                No books read this month.
              </Text>
            </Card>
          )}
        </View>

        {/* All books grid */}
        <View className="gap-3">
          <Text className="text-[15px] font-semibold text-black" variant="body">
            All books in {challenge.year}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {allCompletedBooks.map((book) => (
              <Image
                key={book.id}
                className="h-[102px] w-[72px] rounded-[10px] bg-[#e0e0e0]"
                source={{ uri: book.coverImage }}
              />
            ))}
            {Array.from({ length: placeholderCount }).map((_, i) => (
              <View
                key={`placeholder-${i}`}
                className="h-[102px] w-[72px] items-center justify-center rounded-[10px]"
                style={{
                  borderColor: '#d9d9d9',
                  borderStyle: 'dashed',
                  borderWidth: 1.5,
                }}
              />
            ))}
          </View>
        </View>

        {/* Streak card */}
        <Card className="flex-row items-center gap-4 rounded-[17px] border-[#d9d9d9] bg-[#f9f9f9] px-5 py-4">
          <Text className="text-[32px]" variant="display">
            🔥
          </Text>
          <View className="flex-1 gap-0.5">
            <Text
              className="text-[16px] font-semibold text-black"
              variant="body"
            >
              {streak}-day reading streak
            </Text>
            <Text className="text-[13px] text-[#6d6d6d]" variant="caption">
              Keep the momentum going!
            </Text>
          </View>
        </Card>
      </Container>

      <EditGoalSheet
        key={String(editGoalVisible)}
        currentGoal={challenge.goal}
        onClose={() => setEditGoalVisible(false)}
        onSave={updateGoal}
        visible={editGoalVisible}
      />
    </Screen>
  );
});

ReadingChallengeDetailScreen.displayName = 'ReadingChallengeDetailScreen';
