import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { memo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/atoms/Text';
import {
  useBookReads,
  useBookReadsActions,
} from '@/features/library/hooks/useBookReads';
import type { Book, BookRead } from '@/types';

const BRAND = '#7851A9';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isoToDisplay = (iso: string) => {
  const parts = iso.split('-');
  return `${parts[2] ?? ''}/${parts[1] ?? ''}/${parts[0] ?? ''}`;
};

const displayToIso = (display: string): string | null => {
  const parts = display.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  if (!d || !m || (y ?? '').length !== 4) return null;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

const ordinalReread = (readNumber: number) => {
  if (readNumber === 1) return '1st read';
  const n = readNumber - 1;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  const suffix = s[(v - 20) % 10] ?? s[v] ?? s[0] ?? 'th';
  return `${n}${suffix} re-read`;
};

// ─── Stars row ────────────────────────────────────────────────────────────────

function ReadStars({ value, onChange }: { onChange?: (v: number) => void; value: number }) {
  return (
    <View className="flex-row gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Pressable
          disabled={!onChange}
          hitSlop={6}
          key={i}
          onPress={() => onChange?.(i + 1)}
        >
          <Ionicons
            color={i < value ? '#F5C518' : '#D9D9D9'}
            name={i < value ? 'star' : 'star-outline'}
            size={onChange ? 28 : 14}
          />
        </Pressable>
      ))}
    </View>
  );
}

// ─── Rating trend ─────────────────────────────────────────────────────────────

const RatingTrend = memo(
  ({ ratings }: { ratings: { label: string; rating: number }[] }) => (
    <View
      className="rounded-[12px] border border-[#e8e8e8] bg-[#f9f9f9] px-4 py-3"
    >
      <Text className="mb-3 text-[12px] font-semibold text-[#9b9b9b]" variant="caption">
        RATING OVER TIME
      </Text>
      <View className="flex-row items-center flex-wrap gap-y-2">
        {ratings.map((item, idx) => {
          const prev = idx > 0 ? ratings[idx - 1]?.rating ?? 0 : null;
          const delta = prev !== null ? item.rating - prev : null;
          const arrowColor =
            delta === null ? 'transparent' : delta > 0 ? '#27ae60' : delta < 0 ? '#e53935' : '#9b9b9b';
          const arrowName =
            delta === null
              ? 'remove'
              : delta > 0
                ? 'trending-up'
                : delta < 0
                  ? 'trending-down'
                  : 'remove';
          return (
            <View key={idx} className="flex-row items-center">
              {idx > 0 && (
                <Ionicons
                  color={arrowColor}
                  name={arrowName}
                  size={16}
                  style={{ marginHorizontal: 6 }}
                />
              )}
              <View className="items-center gap-0.5">
                <View className="flex-row items-center gap-0.5">
                  <Ionicons color="#F5C518" name="star" size={12} />
                  <Text className="text-[13px] font-semibold text-black" variant="body">
                    {item.rating}
                  </Text>
                </View>
                <Text className="text-[9px] text-[#9b9b9b]" variant="caption">
                  {item.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  ),
);
RatingTrend.displayName = 'RatingTrend';

// ─── Individual read card ─────────────────────────────────────────────────────

const ReadCard = memo(
  ({
    finishedAt,
    isFirst,
    onDelete,
    rating,
    readNumber,
    review,
    startedAt,
  }: {
    finishedAt?: string;
    isFirst?: boolean;
    onDelete?: () => void;
    rating?: number;
    readNumber: number;
    review?: string;
    startedAt?: string;
  }) => (
    <View className="rounded-[12px] border border-[#e8e8e8] bg-white px-4 py-3">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className="rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: isFirst ? '#ede9f7' : '#eef6f0' }}
          >
            <Text
              className="text-[11px] font-semibold"
              style={{ color: isFirst ? BRAND : '#27ae60' }}
              variant="caption"
            >
              {ordinalReread(readNumber)}
            </Text>
          </View>
          {(startedAt || finishedAt) && (
            <Text className="text-[11px] text-[#9b9b9b]" variant="caption">
              {startedAt ? isoToDisplay(startedAt) : ''}
              {startedAt && finishedAt ? ' → ' : ''}
              {finishedAt ? isoToDisplay(finishedAt) : ''}
            </Text>
          )}
        </View>
        {!isFirst && onDelete && (
          <Pressable
            hitSlop={10}
            onPress={onDelete}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Ionicons color="#c0c0c0" name="trash-outline" size={15} />
          </Pressable>
        )}
      </View>
      {rating ? (
        <ReadStars value={rating} />
      ) : (
        <Text className="text-[11px] text-[#c0c0c0]" variant="caption">
          No rating
        </Text>
      )}
      {review ? (
        <Text className="mt-2 text-[12px] leading-[17px] text-[#444]" numberOfLines={3} variant="body">
          {review}
        </Text>
      ) : null}
    </View>
  ),
);
ReadCard.displayName = 'ReadCard';

// ─── Log re-read bottom sheet ─────────────────────────────────────────────────

type LogSheetProps = {
  onClose: () => void;
  onSave: (data: {
    finishedAt?: string;
    rating: number;
    review?: string;
    startedAt?: string;
  }) => Promise<void>;
  totalPages: number;
  visible: boolean;
};

const LogRereadSheet = memo(({ onClose, onSave, totalPages, visible }: LogSheetProps) => {
  const [startedAt, setStartedAt] = useState('');
  const [finishedAt, setFinishedAt] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);
  const [activePicker, setActivePicker] = useState<'started' | 'finished' | null>(null);

  const reset = () => {
    setStartedAt('');
    setFinishedAt('');
    setRating(0);
    setReview('');
    setActivePicker(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...(displayToIso(startedAt) ? { startedAt: displayToIso(startedAt)! } : {}),
        ...(displayToIso(finishedAt) ? { finishedAt: displayToIso(finishedAt)! } : {}),
        rating,
        ...(review.trim() ? { review: review.trim() } : {}),
      });
      reset();
      onClose();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const getPickerDate = () => {
    const iso = activePicker === 'started' ? displayToIso(startedAt) : displayToIso(finishedAt);
    return iso ? new Date(iso) : new Date();
  };

  const handlePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setActivePicker(null);
      if (event.type === 'dismissed') return;
    }
    if (selected) {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      const display = `${d}/${m}/${y}`;
      if (activePicker === 'started') setStartedAt(display);
      else setFinishedAt(display);
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={handleClose} transparent visible={visible}>
      <Pressable className="absolute inset-0 bg-black/40" onPress={handleClose} />
      <View
        className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-white px-6 pb-10 pt-3"
        style={{ gap: 16 }}
      >
        <View className="h-1 w-10 self-center rounded-full bg-[#d9d9d9]" />
        <Text className="text-[18px] font-semibold text-black" variant="body">
          Log a re-read
        </Text>

        {/* Dates */}
        <View className="flex-row gap-3">
          {(['started', 'finished'] as const).map((type) => {
            const value = type === 'started' ? startedAt : finishedAt;
            const label = type === 'started' ? 'Started on' : 'Finished on';
            return (
              <View key={type} className="flex-1 gap-1.5">
                <Text className="text-[12px] font-semibold text-[#15151e]" variant="body">{label}</Text>
                <Pressable
                  className="flex-row items-center rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9] px-3"
                  onPress={() => setActivePicker(type)}
                  style={{ height: 44 }}
                >
                  <Text
                    className={`flex-1 text-[13px] ${value ? 'text-black' : 'text-[#aaa]'}`}
                    variant="body"
                  >
                    {value || 'DD/MM/YYYY'}
                  </Text>
                  <Ionicons color="#aaa" name="calendar-outline" size={15} />
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Date picker */}
        {activePicker !== null &&
          (Platform.OS === 'ios' ? (
            <Modal animationType="fade" transparent>
              <Pressable
                className="flex-1 items-center justify-end bg-black/40"
                onPress={() => setActivePicker(null)}
              >
                <Pressable
                  className="w-full rounded-t-[18px] bg-white pb-8 pt-2"
                  onPress={() => {}}
                >
                  <View className="flex-row justify-end px-4 pb-1">
                    <Pressable hitSlop={12} onPress={() => setActivePicker(null)}>
                      <Text className="text-[15px] font-semibold text-[#7851A9]" variant="body">Done</Text>
                    </Pressable>
                  </View>
                  <DateTimePicker
                    display="spinner"
                    maximumDate={new Date()}
                    mode="date"
                    onChange={handlePickerChange}
                    value={getPickerDate()}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          ) : (
            <DateTimePicker
              display="default"
              maximumDate={new Date()}
              mode="date"
              onChange={handlePickerChange}
              value={getPickerDate()}
            />
          ))}

        {/* Rating */}
        <View className="gap-2">
          <Text className="text-[12px] font-semibold text-[#15151e]" variant="body">Rating</Text>
          <ReadStars onChange={setRating} value={rating} />
        </View>

        {/* Review */}
        <View className="gap-1.5">
          <Text className="text-[12px] font-semibold text-[#15151e]" variant="body">
            Review{' '}
            <Text className="font-normal text-[#9b9b9b]" variant="body">(optional)</Text>
          </Text>
          <TextInput
            className="rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9] px-3 pt-2.5 text-[13px] text-black"
            multiline
            numberOfLines={3}
            onChangeText={setReview}
            placeholder="How was the re-read?…"
            placeholderTextColor="#aaa"
            style={{ height: 80, textAlignVertical: 'top' }}
            value={review}
          />
        </View>

        {/* Actions */}
        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 items-center justify-center rounded-[10px] border border-[#d9d9d9] py-3"
            onPress={handleClose}
          >
            <Text className="text-[14px] font-medium text-[#6d7a88]" variant="body">Cancel</Text>
          </Pressable>
          <Pressable
            className="flex-[2] items-center justify-center rounded-[10px] py-3"
            disabled={saving}
            onPress={() => void handleSave()}
            style={{ backgroundColor: BRAND, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[14px] font-semibold text-white" variant="body">Save re-read</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});
LogRereadSheet.displayName = 'LogRereadSheet';

// ─── Main section ─────────────────────────────────────────────────────────────

type Props = {
  savedBook: Book;
  userId: string;
};

export const ReadingHistorySection = memo(({ savedBook, userId }: Props) => {
  const { data: reads = [], isLoading } = useBookReads(savedBook.id, userId);
  const { addRead, deleteRead } = useBookReadsActions(savedBook.id, userId);
  const [logSheetVisible, setLogSheetVisible] = useState(false);

  const handleDelete = (read: BookRead) => {
    Alert.alert(
      'Delete re-read?',
      `Remove the ${ordinalReread(read.readNumber)} entry? This cannot be undone.`,
      [
        { style: 'destructive', text: 'Delete', onPress: () => void deleteRead(read.id) },
        { style: 'cancel', text: 'Cancel' },
      ],
    );
  };

  // Build the full timeline: first read from user_books, then re-reads from book_reads.
  // Re-reads start at readNumber 2; if the table already has a readNumber=1 row, we
  // skip the synthetic first-read card to avoid duplication.
  const hasStoredFirstRead = reads.some((r) => r.readNumber === 1);
  const showFirstCard = !hasStoredFirstRead && (!!savedBook.finishedAt || !!savedBook.myRating || !!savedBook.review);

  // Rating trend data across all reads that have a rating
  const ratedItems: { label: string; rating: number }[] = [];
  if (!hasStoredFirstRead && savedBook.myRating) {
    ratedItems.push({ label: '1st', rating: savedBook.myRating });
  }
  reads.forEach((r) => {
    if (r.rating) {
      ratedItems.push({ label: ordinalReread(r.readNumber).split(' ')[0] ?? '', rating: r.rating });
    }
  });

  return (
    <View className="gap-3 px-5 pb-4 pt-2">
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-[15px] font-semibold text-black" variant="body">
            Reading History
          </Text>
          {(reads.length > 0 || showFirstCard) && (
            <View
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: '#ede9f7' }}
            >
              <Text className="text-[11px] font-semibold text-[#7851A9]" variant="caption">
                {reads.length + (showFirstCard ? 1 : 0)}
              </Text>
            </View>
          )}
        </View>
        <Pressable
          className="flex-row items-center gap-1"
          onPress={() => setLogSheetVisible(true)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons color={BRAND} name="add-circle-outline" size={16} />
          <Text className="text-[13px] font-medium text-[#7851A9]" variant="body">
            Log re-read
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={BRAND} />
      ) : reads.length === 0 && !showFirstCard ? (
        <View className="items-center gap-2 rounded-[12px] border border-dashed border-[#d9d9d9] py-6">
          <Ionicons color="#c0c0c0" name="book-outline" size={28} />
          <Text className="text-[13px] text-[#9b9b9b]" variant="body">
            No reading history yet
          </Text>
        </View>
      ) : (
        <>
          {/* First read from user_books */}
          {showFirstCard && (
            <ReadCard
              {...(savedBook.finishedAt ? { finishedAt: savedBook.finishedAt } : {})}
              {...(savedBook.startedAt ? { startedAt: savedBook.startedAt } : {})}
              {...(savedBook.myRating ? { rating: savedBook.myRating } : {})}
              {...(savedBook.review ? { review: savedBook.review } : {})}
              isFirst
              readNumber={1}
            />
          )}

          {/* Re-reads from book_reads table */}
          {reads.map((read) => (
            <ReadCard
              key={read.id}
              {...(read.finishedAt ? { finishedAt: read.finishedAt } : {})}
              {...(read.startedAt ? { startedAt: read.startedAt } : {})}
              {...(read.rating ? { rating: read.rating } : {})}
              {...(read.review ? { review: read.review } : {})}
              isFirst={read.readNumber === 1}
              onDelete={() => handleDelete(read)}
              readNumber={read.readNumber}
            />
          ))}

          {/* Rating trend — only when 2+ reads have ratings */}
          {ratedItems.length >= 2 && <RatingTrend ratings={ratedItems} />}
        </>
      )}

      <LogRereadSheet
        onClose={() => setLogSheetVisible(false)}
        onSave={addRead}
        totalPages={savedBook.pages}
        visible={logSheetVisible}
      />
    </View>
  );
});

ReadingHistorySection.displayName = 'ReadingHistorySection';
