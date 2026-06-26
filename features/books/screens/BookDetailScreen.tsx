import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { AppDialog, type DialogButton } from '@/components/molecules/AppDialog';
import { JournalSection } from '@/features/books/components/JournalSection';
import { QuotesSection } from '@/features/books/components/QuotesSection';
import { ReadingHistorySection } from '@/features/books/components/ReadingHistorySection';
import { AddBookModal } from '@/features/discover/components/AddBookModal';
import { AddToShelfModal } from '@/features/library/components/AddToShelfModal';
import { useBookShelfIds } from '@/features/library/hooks/useBookShelfIds';
import { useCustomShelves } from '@/features/library/hooks/useCustomShelves';
import {
  userBooksQueryKey,
  useUserBooks,
} from '@/features/library/hooks/useUserBooks';
import { deleteCommunityBook } from '@/services/books/communityBooks';
import {
  mirrorCoverToStorage,
  uploadCoverFromBase64,
} from '@/services/books/coverStorage';
import { useAuthStore } from '@/store/authStore';
import { useBookStore } from '@/store/bookStore';
import type { Book, BookFormat, ReadingDataUpdate } from '@/types';

type Tab = 'info' | 'my-reading';
type InfoSubTab = 'about' | 'reviews' | 'similar';

type BookDetailScreenProps = {
  book: Book;
  initialTab?: Tab;
};

const BRAND = '#c1eeff';

const ExpandableText = memo(
  ({
    className,
    maxLines = 4,
    text,
  }: {
    className?: string;
    maxLines?: number;
    text: string;
  }) => {
    const [expanded, setExpanded] = useState(false);
    const [overflows, setOverflows] = useState(false);

    return (
      <View>
        {/* Hidden full render — measures real line count without numberOfLines cap */}
        <View pointerEvents="none" style={{ opacity: 0, position: 'absolute' }}>
          <Text
            {...(className !== undefined ? { className } : {})}
            onTextLayout={(e) => {
              setOverflows(e.nativeEvent.lines.length > maxLines);
            }}
          >
            {text}
          </Text>
        </View>
        <Text
          {...(className !== undefined ? { className } : {})}
          {...(!expanded ? { numberOfLines: maxLines } : {})}
        >
          {text}
        </Text>
        {overflows && (
          <Pressable hitSlop={8} onPress={() => setExpanded((v) => !v)}>
            <Text className="mt-1 text-[12px] font-medium text-[#655356]">
              {expanded ? 'Show less' : 'Read more'}
            </Text>
          </Pressable>
        )}
      </View>
    );
  },
);
ExpandableText.displayName = 'ExpandableText';

const FORMATS: { label: string; value: BookFormat }[] = [
  { label: 'Paper', value: 'paper' },
  { label: 'E-book', value: 'ebook' },
  { label: 'Audio', value: 'audio' },
];

const PRESET_TAGS: { emoji: string; label: string; value: string }[] = [
  { emoji: '📱', label: 'BookTok', value: 'booktok' },
  { emoji: '📸', label: 'Instagram', value: 'instagram' },
  { emoji: '👥', label: 'Friend rec', value: 'friend-rec' },
  { emoji: '🏪', label: 'Bookstore find', value: 'bookstore' },
  { emoji: '📚', label: 'Goodreads', value: 'goodreads' },
  { emoji: '📰', label: 'Blog / article', value: 'blog' },
  { emoji: '🎬', label: 'Movie / series', value: 'movie' },
  { emoji: '🎁', label: 'Gift', value: 'gift' },
];

const isoToDisplay = (iso: string): string => {
  const parts = iso.split('-');
  const y = parts[0] ?? '';
  const m = parts[1] ?? '';
  const d = parts[2] ?? '';
  return `${d}/${m}/${y}`;
};

const displayToIso = (display: string): string | null => {
  const parts = display.split('/');
  if (parts.length !== 3) return null;
  const d = parts[0] ?? '';
  const m = parts[1] ?? '';
  const y = parts[2] ?? '';
  if (!d || !m || y.length !== 4) return null;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-[12px] font-bold text-[#28231c]">{label}</Text>
      <Text className="text-[12px] text-[#28231c]">{value}</Text>
    </View>
  );
}

function StaticStars({ rating }: { rating: number }) {
  if (!rating) {
    return (
      <View style={{ alignSelf: 'flex-start', backgroundColor: '#f0ece8', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
        <Text style={{ fontSize: 11, color: '#a09090' }}>No reviews yet</Text>
      </View>
    );
  }
  const full = Math.round(rating);
  return (
    <View className="flex-row items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          color={i < full ? '#F5C518' : '#D9D9D9'}
          name="star"
          size={16}
        />
      ))}
      <Text className="ml-1 text-[13px] text-[#6d7a88]">
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

function InteractiveStars({
  onChange,
  value,
}: {
  onChange: (v: number) => void;
  value: number;
}) {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Pressable hitSlop={8} key={i} onPress={() => onChange(i + 1)}>
          <Ionicons
            color={i < value ? '#F5C518' : '#D9D9D9'}
            name={i < value ? 'star' : 'star-outline'}
            size={32}
          />
        </Pressable>
      ))}
    </View>
  );
}

function DateField({
  label,
  onPress,
  value,
}: {
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <View className="flex-1 gap-1.5">
      <Text className="text-[12px] font-semibold text-[#28231c]">{label}</Text>
      <Pressable
        className="flex-row items-center rounded-[8px] border border-[#d9d9d9] bg-[#FFFFFFBD] px-3"
        onPress={onPress}
        style={{ height: 44 }}
      >
        <Text
          className={`flex-1 text-[13px] ${value ? 'text-black' : 'text-[#aaa]'}`}
        >
          {value || 'DD/MM/YYYY'}
        </Text>
        <Ionicons color="#aaa" name="calendar-outline" size={16} />
      </Pressable>
    </View>
  );
}

type LocalDialogConfig = {
  buttons: DialogButton[];
  message?: string;
  title: string;
} | null;

function MyReadingTab({
  onAddToLibrary,
  savedBook,
  userId,
}: {
  onAddToLibrary: () => void;
  savedBook: Book | undefined;
  userId: string;
}) {
  const router = useRouter();
  const saveReadingData = useBookStore((s) => s.saveReadingData);
  const { data: shelfIds = [] } = useBookShelfIds(
    savedBook?.id ?? null,
    userId,
  );
  const { data: allShelves = [] } = useCustomShelves(userId);
  const [localDialog, setLocalDialog] = useState<LocalDialogConfig>(null);

  const progressToPages = (book: Book) =>
    book.progress > 0 && book.pages > 0
      ? String(Math.round((book.progress / 100) * book.pages))
      : '';

  const [myRating, setMyRating] = useState(savedBook?.myRating ?? 0);
  const [pagesRead, setPagesRead] = useState(
    savedBook ? progressToPages(savedBook) : '',
  );
  const [dnfPage, setDnfPage] = useState(
    savedBook?.dnfPage != null ? String(savedBook.dnfPage) : '',
  );
  const [dnfReason, setDnfReason] = useState(savedBook?.dnfReason ?? '');
  const [startedAt, setStartedAt] = useState(
    savedBook?.startedAt ? isoToDisplay(savedBook.startedAt) : '',
  );
  const [finishedAt, setFinishedAt] = useState(
    savedBook?.finishedAt ? isoToDisplay(savedBook.finishedAt) : '',
  );
  const [format, setFormat] = useState<BookFormat | undefined>(
    savedBook?.format,
  );
  const [review, setReview] = useState(savedBook?.review ?? '');
  const [reviewSpoiler, setReviewSpoiler] = useState(savedBook?.reviewSpoiler ?? false);
  const [note, setNote] = useState(savedBook?.note ?? '');
  const [boughtAt, setBoughtAt] = useState(
    savedBook?.boughtAt ? isoToDisplay(savedBook.boughtAt) : '',
  );
  const [tags, setTags] = useState<string[]>(savedBook?.tags ?? []);
  const [personalOpen, setPersonalOpen] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activePicker, setActivePicker] = useState<
    'started' | 'finished' | 'bought' | null
  >(null);
  const [addToShelfVisible, setAddToShelfVisible] = useState(false);

  const getPickerDate = () => {
    const iso =
      activePicker === 'started'
        ? displayToIso(startedAt)
        : activePicker === 'bought'
          ? displayToIso(boughtAt)
          : displayToIso(finishedAt);
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
      else if (activePicker === 'bought') setBoughtAt(display);
      else setFinishedAt(display);
    }
  };

  const toggleTag = (value: string) =>
    setTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    );

  if (!savedBook) {
    return (
      <View className="mx-5 items-center gap-4 py-10">
        <Ionicons color="#d9d9d9" name="book-outline" size={48} />
        <Text className="text-center text-[14px] text-[#6d7a88]">
          Add this book to your library to track your reading.
        </Text>
        <Pressable
          className="items-center justify-center rounded-[8px] px-6 py-2.5"
          onPress={onAddToLibrary}
          style={{ backgroundColor: BRAND }}
        >
          <Text className="text-[13px] font-semibold text-[#070707]">
            Add to Library
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const isDnf = savedBook.status === 'dnf';
      const updates: ReadingDataUpdate = {
        boughtAt: displayToIso(boughtAt),
        ...(isDnf
          ? {
              dnfPage: dnfPage ? parseInt(dnfPage, 10) : null,
              dnfReason: dnfReason.trim() || null,
            }
          : { dnfPage: null, dnfReason: null }),
        finishedAt: displayToIso(finishedAt),
        myRating: myRating > 0 ? myRating : null,
        note: note.trim() || null,
        progress:
          pagesRead && savedBook.pages > 0
            ? Math.min(
                100,
                Math.round((parseInt(pagesRead, 10) / savedBook.pages) * 100),
              )
            : 0,
        review: review.trim() || null,
        reviewSpoiler: review.trim() ? reviewSpoiler : false,
        startedAt: displayToIso(startedAt),
        tags,
        ...(format !== undefined ? { format } : {}),
      };
      await saveReadingData(userId, savedBook.id, updates);
      setLocalDialog({
        title: 'Saved!',
        message: 'Your reading info has been updated.',
        buttons: [{ label: 'OK', onPress: () => {} }],
      });
    } catch {
      setLocalDialog({
        title: 'Error',
        message: 'Could not save. Please try again.',
        buttons: [{ label: 'OK', onPress: () => {} }],
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="gap-5 px-5 pb-6 pt-1">
        {/* Rate */}
        <View className="gap-2">
          <Text className="text-[13px] font-semibold text-[#28231c]">Rate</Text>
          <InteractiveStars onChange={setMyRating} value={myRating} />
        </View>

        {/* Pages read */}
        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold text-[#28231c]">
            Pages read
          </Text>
          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 rounded-[8px] border border-[#d9d9d9] bg-[#FFFFFFBD] px-3 text-[14px] text-black"
              keyboardType="number-pad"
              maxLength={5}
              onChangeText={setPagesRead}
              placeholder={`0 – ${savedBook.pages}`}
              placeholderTextColor="#aaa"
              style={{ height: 44 }}
              value={pagesRead}
            />
            <Text className="text-[13px] text-[#6d7a88]">
              / {savedBook.pages}
            </Text>
          </View>
        </View>

        {/* DNF details — only visible when status is Did Not Finish */}
        {savedBook.status === 'dnf' && (
          <View
            className="gap-3 rounded-[12px] border border-[#f0dde0] px-4 py-4"
            style={{ backgroundColor: '#fff8f8' }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons color="#c0392b" name="close-circle-outline" size={16} />
              <Text className="text-[13px] font-semibold text-[#c0392b]">
                Did Not Finish
              </Text>
            </View>
            <View className="gap-1.5">
              <Text className="text-[12px] font-semibold text-[#28231c]">
                Stopped at page
              </Text>
              <View className="flex-row items-center gap-3">
                <TextInput
                  className="flex-1 rounded-[8px] border border-[#d9d9d9] bg-white px-3 text-[14px] text-black"
                  keyboardType="number-pad"
                  maxLength={5}
                  onChangeText={setDnfPage}
                  placeholder={`1 – ${savedBook.pages}`}
                  placeholderTextColor="#aaa"
                  style={{ height: 44 }}
                  value={dnfPage}
                />
                <Text className="text-[13px] text-[#6d7a88]">
                  / {savedBook.pages}
                </Text>
              </View>
            </View>
            <View className="gap-1.5">
              <Text className="text-[12px] font-semibold text-[#28231c]">
                Reason{' '}
                <Text className="font-normal text-[#655356]">(optional)</Text>
              </Text>
              <TextInput
                className="rounded-[8px] border border-[#d9d9d9] bg-white px-3 pt-2.5 text-[13px] text-black"
                maxLength={200}
                multiline
                numberOfLines={3}
                onChangeText={setDnfReason}
                placeholder="Why did you stop? (e.g. not my genre, too slow…)"
                placeholderTextColor="#aaa"
                style={{ height: 80, textAlignVertical: 'top' }}
                value={dnfReason}
              />
            </View>
          </View>
        )}

        {/* Dates */}
        <View className="flex-row gap-3">
          <DateField
            label="Started on"
            onPress={() => setActivePicker('started')}
            value={startedAt}
          />
          <DateField
            label="Finished on"
            onPress={() => setActivePicker('finished')}
            value={finishedAt}
          />
        </View>

        {/* Date Picker */}
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
                    <Pressable
                      hitSlop={12}
                      onPress={() => setActivePicker(null)}
                    >
                      <Text className="text-[15px] font-semibold text-[#655356]">
                        Done
                      </Text>
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

        {/* Review */}
        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold text-[#28231c]">
            Review
          </Text>
          <TextInput
            className="rounded-[8px] border border-[#d9d9d9] bg-[#FFFFFFBD] px-3 pt-2.5 text-[13px] text-black"
            multiline
            numberOfLines={4}
            onChangeText={setReview}
            placeholder="Write your review..."
            placeholderTextColor="#aaa"
            style={{ height: 110, textAlignVertical: 'top' }}
            value={review}
          />
          <Pressable
            onPress={() => setReviewSpoiler((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, alignSelf: 'flex-start' }}
          >
            <View style={{
              width: 18, height: 18, borderRadius: 4,
              borderWidth: 1.5,
              borderColor: reviewSpoiler ? BRAND : '#655356',
              backgroundColor: reviewSpoiler ? BRAND : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {reviewSpoiler && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={{ fontSize: 12, color: reviewSpoiler ? BRAND : '#888' }}>
              Mark as spoiler
            </Text>
          </Pressable>
        </View>

        {/* Format */}
        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold text-[#28231c]">
            Format
          </Text>
          <View
            className="flex-row rounded-[8px] border border-[#d9d9d9] bg-[#FFFFFFBD]"
            style={{ height: 40 }}
          >
            {FORMATS.map((f, index) => {
              const isActive = format === f.value;
              return (
                <Pressable
                  key={f.value}
                  className="flex-1 items-center justify-center"
                  onPress={() => setFormat(isActive ? undefined : f.value)}
                  style={
                    isActive && {
                      backgroundColor: BRAND,
                      borderTopLeftRadius: index === 0 ? 7 : 0,
                      borderBottomLeftRadius: index === 0 ? 7 : 0,
                      borderTopRightRadius: index === 2 ? 7 : 0,
                      borderBottomRightRadius: index === 2 ? 7 : 0,
                    }
                  }
                >
                  <Text
                    className={`text-[11px] font-medium ${isActive ? 'text-[#070707]' : 'text-[#444]'}`}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bookshelves */}
        {(() => {
          const STATUS_LABEL: Record<string, string> = {
            'want-to-read': 'TBR',
            reading: 'Currently Reading',
            completed: 'Finished',
            dnf: 'Did Not Finish',
          };
          const parts: string[] = [];
          if (savedBook?.status)
            parts.push(STATUS_LABEL[savedBook.status] ?? '');
          const customNames = allShelves
            .filter((s) => shelfIds.includes(s.id))
            .map((s) => s.name);
          parts.push(...customNames);
          const summary = parts.filter(Boolean).join(' · ');
          return (
            <View className="gap-2">
              <Text className="text-[13px] font-semibold text-[#28231c]">
                Bookshelves
              </Text>
              <Pressable
                className="flex-row items-center gap-3 rounded-[12px] border border-[#d9d9d9] bg-[#FFFFFFBD] px-5 py-4"
                onPress={() => setAddToShelfVisible(true)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Ionicons color="#655356" name="bookmark-outline" size={18} />
                <Text
                  className="flex-1 text-[14px]"
                  numberOfLines={1}
                  style={{ color: summary ? '#28231c' : '#655356' }}
                >
                  {summary || 'Add to bookshelves…'}
                </Text>
                <Ionicons color="#c0c0c0" name="chevron-forward" size={16} />
              </Pressable>
            </View>
          );
        })()}

        {/* Note */}
        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold text-[#28231c]">Note</Text>
          <TextInput
            className="rounded-[8px] border border-[#d9d9d9] bg-[#FFFFFFBD] px-3 pt-2.5 text-[13px] text-black"
            multiline
            numberOfLines={3}
            onChangeText={setNote}
            placeholder="Note something..."
            placeholderTextColor="#aaa"
            style={{ height: 80, textAlignVertical: 'top' }}
            value={note}
          />
        </View>

        {/* Personal details accordion */}
        <View className="overflow-hidden rounded-[12px] border border-[#e8e8e8]">
          <Pressable
            className="flex-row items-center justify-between bg-[#FFFFFFBD] px-4 py-3"
            onPress={() => setPersonalOpen((v) => !v)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons color="#655356" name="bookmark-outline" size={16} />
              <Text className="text-[13px] font-semibold text-[#28231c]">
                Personal details
              </Text>
            </View>
            <Ionicons
              color="#655356"
              name={personalOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
            />
          </Pressable>

          {personalOpen && (
            <View className="gap-4 px-4 pb-4 pt-3">
              {/* Date bought */}
              <DateField
                label="Date bought"
                onPress={() => setActivePicker('bought')}
                value={boughtAt}
              />

              {/* How did you find it */}
              <View className="gap-2">
                <Text className="text-[12px] font-semibold text-[#28231c]">
                  How did you find it?
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {PRESET_TAGS.map((tag) => {
                    const active = tags.includes(tag.value);
                    return (
                      <Pressable
                        key={tag.value}
                        className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
                        onPress={() => toggleTag(tag.value)}
                        style={{ backgroundColor: active ? '#c1eeff' : '#e2f5ff' }}
                      >
                        <Text className="text-[12px]">{tag.emoji}</Text>
                        <Text
                          className={`text-[12px] font-medium ${active ? 'text-[#070707]' : 'text-[#655356]'}`}
                        >
                          {tag.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {tags.filter((t) => !PRESET_TAGS.some((p) => p.value === t)).map((t) => (
                    <Pressable
                      key={t}
                      className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
                      onPress={() => toggleTag(t)}
                      style={{ backgroundColor: '#c1eeff' }}
                    >
                      <Text className="text-[12px] font-medium text-[#070707]">{t}</Text>
                      <Ionicons color="rgba(7,7,7,0.5)" name="close" size={12} />
                    </Pressable>
                  ))}
                </View>
                {showCustomTagInput ? (
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      autoFocus
                      className="flex-1 rounded-full border border-[#d9d9d9] bg-[#FFFFFFBD] px-3 text-[13px] text-black"
                      maxLength={30}
                      onChangeText={setCustomTagInput}
                      onSubmitEditing={() => {
                        const t = customTagInput.trim();
                        if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
                        setCustomTagInput('');
                        setShowCustomTagInput(false);
                      }}
                      onBlur={() => {
                        if (!customTagInput.trim()) setShowCustomTagInput(false);
                      }}
                      placeholder="Type a tag…"
                      placeholderTextColor="#aaa"
                      returnKeyType="done"
                      style={{ height: 36 }}
                      value={customTagInput}
                    />
                    <Pressable
                      className="items-center justify-center rounded-full bg-[#c1eeff]"
                      onPress={() => {
                        const t = customTagInput.trim();
                        if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
                        setCustomTagInput('');
                        setShowCustomTagInput(false);
                      }}
                      style={{ height: 36, width: 36 }}
                    >
                      <Ionicons color="white" name="add" size={20} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    className="flex-row items-center gap-1 self-start rounded-full border border-dashed border-[#c0b4d8] px-3 py-1.5"
                    onPress={() => setShowCustomTagInput(true)}
                  >
                    <Ionicons color="#655356" name="add" size={14} />
                    <Text className="text-[12px] text-[#655356]">Custom tag</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3 pt-1">
          <Pressable
            className="flex-1 items-center justify-center rounded-[8px] border border-[#d9d9d9] py-3"
            onPress={handleCancel}
          >
            <Text className="text-[14px] font-medium text-[#6d7a88]">
              Cancel
            </Text>
          </Pressable>
          <Pressable
            className="flex-[2] items-center justify-center rounded-[8px] py-3"
            disabled={saving}
            onPress={() => void handleSave()}
            style={{ backgroundColor: BRAND, opacity: saving ? 0.6 : 1 }}
          >
            <Text className="text-[14px] font-semibold text-[#070707]">
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ReadingHistorySection savedBook={savedBook} userId={userId} />

      <QuotesSection bookApiId={savedBook.id} userId={userId} />

      <JournalSection bookApiId={savedBook.id} userId={userId} />

      <AppDialog
        buttons={localDialog?.buttons ?? []}
        message={localDialog?.message}
        onClose={() => setLocalDialog(null)}
        title={localDialog?.title ?? ''}
        visible={!!localDialog}
      />
      <AddToShelfModal
        bookApiId={savedBook?.id ?? null}
        visible={addToShelfVisible}
        onClose={() => setAddToShelfVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

type DialogConfig = {
  buttons: DialogButton[];
  message?: string;
  title: string;
} | null;

export function BookDetailScreen({
  book,
  initialTab = 'my-reading',
}: BookDetailScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [infoSubTab, setInfoSubTab] = useState<InfoSubTab>('about');
  const [fabOpen, setFabOpen] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { data: userBooks = [] } = useUserBooks(user?.id ?? null);
  const savedBook = userBooks.find((b) => b.id === book.id);
  const isInLibrary = !!savedBook;
  // book prop is the user_books record when loaded from library — use as fallback
  // before useUserBooks finishes its first load in this component instance
  const myRating = savedBook?.myRating ?? book.myRating;
  const userReview = savedBook?.review ?? book.review;
  const userReviewSpoiler = savedBook?.reviewSpoiler ?? false;
  const isCommunityBook = book.id.startsWith('custom-');

  const removeBook = useBookStore((s) => s.removeBook);
  const updateBookMeta = useBookStore((s) => s.updateBookMeta);

  const handleDeleteBook = () => {
    if (!user) return;
    setDialog({
      title: 'Delete book?',
      message: `"${book.title}" will be permanently removed from the community library and all reading lists.`,
      buttons: [
        {
          label: 'Delete',
          type: 'destructive',
          onPress: () => {
            const rawId = book.id.replace(/^custom-/, '');
            void (async () => {
              try {
                await deleteCommunityBook(rawId);
                void queryClient.invalidateQueries({
                  queryKey: userBooksQueryKey(user.id),
                });
                router.back();
              } catch {
                setDialog({
                  title: 'Error',
                  message: 'Could not delete the book. Please try again.',
                  buttons: [{ label: 'OK', onPress: () => {} }],
                });
              }
            })();
          },
        },
        { label: 'Cancel', type: 'cancel', onPress: () => {} },
      ],
    });
  };
  const [dialog, setDialog] = useState<DialogConfig>(null);
  const [addToLibraryVisible, setAddToLibraryVisible] = useState(false);
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const [coverInput, setCoverInput] = useState('');
  const [coverSaving, setCoverSaving] = useState(false);
  const [localCoverPreview, setLocalCoverPreview] = useState<string | null>(null);
  const [editInfoExpanded, setEditInfoExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);
  const [editPages, setEditPages] = useState(book.pages > 0 ? String(book.pages) : '');
  const [editPublisher, setEditPublisher] = useState(book.publisher ?? '');
  const [editYear, setEditYear] = useState(book.publishedYear > 0 ? String(book.publishedYear) : '');
  const [editLanguage, setEditLanguage] = useState(book.language ?? '');
  const [editIsbn, setEditIsbn] = useState(book.isbn ?? '');
  const [editDescription, setEditDescription] = useState(book.description);
  const [editGenres, setEditGenres] = useState(book.genres.join(', '));
  const [editSaving, setEditSaving] = useState(false);

  const handleBookEdited = (updatedBook: Book) => {
    if (!user) return;
    // Always key on book.id (the book currently on screen). updatedBook.id can
    // differ when AddBookModal's duplicate-detection branch updates a different
    // community book row instead of the one the user is viewing.
    const currentId = book.id;
    queryClient.setQueryData(['book', currentId], {
      ...updatedBook,
      id: currentId,
    });
    if (isInLibrary) {
      // Patch only metadata — status/progress/reading data are preserved.
      queryClient.setQueryData(userBooksQueryKey(user.id), (old: Book[] = []) =>
        old.map((b) =>
          b.id === currentId
            ? {
                ...b,
                author: updatedBook.author,
                coverImage: updatedBook.coverImage,
                description: updatedBook.description,
                genres: updatedBook.genres,
                isbn: updatedBook.isbn,
                language: updatedBook.language,
                pages: updatedBook.pages,
                publishedYear: updatedBook.publishedYear,
                publisher: updatedBook.publisher,
                rating: updatedBook.rating,
                title: updatedBook.title,
              }
            : b,
        ),
      );
      // Persist to DB. On success, invalidateQueries inside updateBookMeta
      // fires a refetch that confirms the new data. On failure, the optimistic
      // update above stays visible — we don't revert by calling invalidateQueries.
      void updateBookMeta(user.id, currentId, updatedBook).catch(() => {});
    } else {
      void queryClient.invalidateQueries({
        queryKey: userBooksQueryKey(user.id),
      });
    }
  };

  const handleAddToLibrary = () => {
    if (!user) return;
    setAddToLibraryVisible(true);
  };

  const handleSaveCover = async () => {
    const trimmed = coverInput.trim();
    const liveBook = savedBook ?? book;
    if (!trimmed) {
      handleBookEdited({ ...liveBook, coverImage: '' });
      setCoverModalVisible(false);
      return;
    }
    setCoverSaving(true);
    try {
      const finalUrl = user
        ? await mirrorCoverToStorage(trimmed, user.id, book.id)
        : trimmed;
      handleBookEdited({ ...liveBook, coverImage: finalUrl });
      setCoverModalVisible(false);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      setCoverModalVisible(false);
      setDialog({
        title: 'Upload failed',
        message: `Could not save to your storage: ${reason}\n\nSave the original URL for now?`,
        buttons: [
          {
            label: 'Save URL',
            onPress: () => handleBookEdited({ ...liveBook, coverImage: trimmed }),
          },
          { label: 'Cancel', type: 'cancel', onPress: () => {} },
        ],
      });
    } finally {
      setCoverSaving(false);
    }
  };

  const pickAndUploadCover = async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setDialog({
        title: 'Permission needed',
        message: 'Please allow access to your photo library in Settings.',
        buttons: [{ label: 'OK', onPress: () => {} }],
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const base64 = asset.base64;
    if (!base64) return;
    setCoverModalVisible(false);
    setLocalCoverPreview(asset.uri);
    setCoverSaving(true);
    try {
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const finalUrl = await uploadCoverFromBase64(base64, mimeType, user.id, book.id);
      const liveBook = savedBook ?? book;
      handleBookEdited({ ...liveBook, coverImage: finalUrl });
    } catch {
      setDialog({
        title: 'Upload failed',
        message: 'Could not upload image. Please try again.',
        buttons: [{ label: 'OK', onPress: () => {} }],
      });
    } finally {
      setLocalCoverPreview(null);
      setCoverSaving(false);
    }
  };

  const handleSaveBookInfo = async () => {
    if (editSaving) return;
    setEditSaving(true);
    try {
      const liveBook = savedBook ?? book;
      const updated: Book = {
        ...liveBook,
        author: editAuthor.trim() || liveBook.author,
        description: editDescription.trim(),
        genres: editGenres
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean),
        ...(editIsbn.trim() ? { isbn: editIsbn.trim() } : {}),
        ...(editLanguage.trim() ? { language: editLanguage.trim() } : {}),
        pages: parseInt(editPages, 10) || liveBook.pages,
        publishedYear: parseInt(editYear, 10) || liveBook.publishedYear,
        ...(editPublisher.trim() ? { publisher: editPublisher.trim() } : {}),
        title: editTitle.trim() || liveBook.title,
      };
      handleBookEdited(updated);
      setEditInfoExpanded(false);
    } finally {
      setEditSaving(false);
    }
  };

  const handleRemoveFromLibrary = () => {
    if (!user) return;
    setDialog({
      title: 'Remove from library?',
      message: `"${book.title}" will be removed from your entire library and all bookshelves, including any reading progress, ratings, and notes.`,
      buttons: [
        {
          label: 'Remove',
          type: 'destructive',
          onPress: () => {
            void removeBook(user.id, book.id);
            router.back();
          },
        },
        { label: 'Cancel', type: 'cancel', onPress: () => {} },
      ],
    });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Book Info' },
    { id: 'my-reading', label: 'My Reading' },
  ];

  const HERO_HEIGHT = 370;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F6F4]" edges={['top']}>

      {/* ── Fixed cover layer (behind scroll) ──────────────────────────── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: HERO_HEIGHT, backgroundColor: '#F8F6F4', alignItems: 'center', paddingTop: 50 }}>
        <Pressable
          disabled={!isInLibrary}
          onPress={() => {
            setCoverInput((savedBook ?? book).coverImage ?? '');
            setCoverModalVisible(true);
          }}
          style={{ position: 'relative' }}
        >
          {(() => {
            const displayCover = localCoverPreview ?? (savedBook ?? book).coverImage;
            return displayCover ? (
              <View style={{
                width: 200, height: 294, borderRadius: 14,
                shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.28, shadowRadius: 16, elevation: 10,
              }}>
                <Image
                  resizeMode="cover"
                  source={{ uri: displayCover }}
                  style={{ width: 200, height: 294, borderRadius: 14, backgroundColor: '#e2f5ff' }}
                />
              </View>
            ) : (
              <View style={{
                width: 200, height: 294, borderRadius: 14,
                backgroundColor: '#e2f5ff',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.18, shadowRadius: 16, elevation: 10,
              }}>
                <Ionicons color="#655356" name="book-outline" size={64} />
              </View>
            );
          })()}
          {coverSaving && (
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 14,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons color="white" name="cloud-upload-outline" size={28} />
            </View>
          )}
          {isInLibrary && !coverSaving && (
            <View style={{
              position: 'absolute', bottom: 8, right: 8,
              backgroundColor: '#c1eeff', borderRadius: 14, padding: 6,
            }}>
              <Ionicons color="#070707" name="camera-outline" size={14} />
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Scrollable content (slides over cover on scroll) ───────────── */}
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingTop: HERO_HEIGHT - 50, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: '#F8F6F4', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(40,35,28,0.15)' }} />
          </View>

        {/* ── Title + Author + meta ──────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 20, gap: 6 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#070707', lineHeight: 30, letterSpacing: -0.4 }}>
            {book.title}
          </Text>
          <Text style={{ fontSize: 15, color: '#655356' }}>
            {book.author}
          </Text>
          <View style={{ marginTop: 2 }}>
            {myRating ? (
              <View style={{ gap: 2 }}>
                <StaticStars rating={myRating} />
                <Text style={{ fontSize: 11, color: '#655356' }}>My rating</Text>
              </View>
            ) : (
              <StaticStars rating={book.rating} />
            )}
          </View>
          {/* Meta chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {book.pages > 0 && (
              <View style={{ backgroundColor: '#e2f5ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, color: '#655356' }}>{book.pages} pages</Text>
              </View>
            )}
            {book.publishedYear > 0 && (
              <View style={{ backgroundColor: '#F2EEE9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, color: '#655356' }}>{book.publishedYear}</Text>
              </View>
            )}
            {book.genres.slice(0, 2).map((g) => (
              <View key={g} style={{ backgroundColor: '#F2EEE9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 12, color: '#655356' }}>{g}</Text>
              </View>
            ))}
          </View>
          {/* Full-width CTA */}
          <Pressable
            accessibilityLabel={isInLibrary ? 'In Library' : 'Add to Library'}
            accessibilityRole="button"
            onPress={() => isInLibrary ? handleRemoveFromLibrary() : handleAddToLibrary()}
            style={({ pressed }) => ({
              marginTop: 12,
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: 'center',
              backgroundColor: BRAND,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#070707' }}>
              {isInLibrary ? '✓ In Library' : 'Add to Library'}
            </Text>
          </Pressable>
        </View>

        {/* ── Tab bar ───────────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginBottom: 16,
          backgroundColor: '#F2EEE9',
          borderRadius: 13,
          padding: 4,
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityLabel={tab.label}
                accessibilityRole="tab"
                onPress={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  paddingVertical: 9, borderRadius: 10,
                  backgroundColor: isActive ? '#513b3c' : 'transparent',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: isActive ? '600' : '400', color: isActive ? '#ffffff' : '#655356' }}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Book Info tab */}
        {activeTab === 'info' && (
          <>
            {/* Sub-tab bar: About / Reviews / Similar */}
            <View style={{
              flexDirection: 'row',
              marginHorizontal: 20,
              marginBottom: 16,
              backgroundColor: '#F2EEE9',
              borderRadius: 13,
              padding: 4,
            }}>
              {(['about', 'reviews', 'similar'] as InfoSubTab[]).map((sub) => {
                const isActive = infoSubTab === sub;
                const label = sub === 'similar' ? 'Similar ✨' : sub.charAt(0).toUpperCase() + sub.slice(1);
                return (
                  <Pressable
                    key={sub}
                    accessibilityLabel={label}
                    accessibilityRole="tab"
                    onPress={() => setInfoSubTab(sub)}
                    style={{
                      flex: 1, alignItems: 'center', justifyContent: 'center',
                      paddingVertical: 8, borderRadius: 10,
                      backgroundColor: isActive ? '#513b3c' : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: isActive ? '600' : '400', color: isActive ? '#ffffff' : '#655356' }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* About sub-tab */}
            {infoSubTab === 'about' && (
              <>
                {/* Description card */}
                <View
                  className="mx-5 mb-4 rounded-[10px] border border-[#d9d9d9] p-5"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.74)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.16,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text className="mb-2 text-[14px] font-semibold text-[#28231c]">
                    Description
                  </Text>
                  <ExpandableText
                    className="mb-2 text-[12px] leading-[16px] text-[#28231c]"
                    text={book.description || 'No description available.'}
                  />
                  <View className="flex-row gap-8">
                    <View className="flex-1 gap-3">
                      <MetaRow
                        label="Publish date"
                        value={
                          book.publishedYear > 0
                            ? String(book.publishedYear)
                            : '—'
                        }
                      />
                      <MetaRow
                        label="Pages"
                        value={book.pages > 0 ? String(book.pages) : '—'}
                      />
                      <MetaRow label="ISBN" value={book.isbn ?? '—'} />
                    </View>
                    <View className="flex-1 gap-3">
                      <MetaRow
                        label="Publisher"
                        value={book.publisher ?? '—'}
                      />
                      <MetaRow label="Language" value={book.language ?? '—'} />
                      <MetaRow
                        label="Categories"
                        value={
                          book.genres.length ? book.genres.join(', ') : '—'
                        }
                      />
                    </View>
                  </View>
                </View>

                {/* Edit book info accordion — only for library books */}
                {isInLibrary && (
                  <View className="mx-5 mb-4 overflow-hidden rounded-[12px] border border-[#e8e8e8]">
                    <Pressable
                      className="flex-row items-center justify-between px-4 py-3"
                      onPress={() => setEditInfoExpanded((v) => !v)}
                      style={({ pressed }) => ({ backgroundColor: 'rgba(255,255,255,0.74)', opacity: pressed ? 0.7 : 1 })}
                    >
                      <View className="flex-row items-center gap-2">
                        <Ionicons color="#655356" name="pencil-outline" size={16} />
                        <Text className="text-[13px] font-semibold text-[#28231c]">
                          Edit book info
                        </Text>
                      </View>
                      <Ionicons
                        color="#655356"
                        name={editInfoExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                      />
                    </Pressable>

                    {editInfoExpanded && (
                      <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                      >
                        <View className="gap-3 px-4 pb-4 pt-3">
                          {[
                            { label: 'Title', value: editTitle, setter: setEditTitle, multiline: false, keyboard: 'default' as const },
                            { label: 'Author', value: editAuthor, setter: setEditAuthor, multiline: false, keyboard: 'default' as const },
                            { label: 'Pages', value: editPages, setter: setEditPages, multiline: false, keyboard: 'number-pad' as const },
                            { label: 'Published year', value: editYear, setter: setEditYear, multiline: false, keyboard: 'number-pad' as const },
                            { label: 'Publisher', value: editPublisher, setter: setEditPublisher, multiline: false, keyboard: 'default' as const },
                            { label: 'Language', value: editLanguage, setter: setEditLanguage, multiline: false, keyboard: 'default' as const },
                            { label: 'ISBN', value: editIsbn, setter: setEditIsbn, multiline: false, keyboard: 'default' as const },
                            { label: 'Genres (comma-separated)', value: editGenres, setter: setEditGenres, multiline: false, keyboard: 'default' as const },
                          ].map(({ label, value, setter, keyboard }) => (
                            <View key={label} className="gap-1">
                              <Text className="text-[11px] font-semibold text-[#6d7a88]">
                                {label}
                              </Text>
                              <TextInput
                                className="rounded-[8px] border border-[#d9d9d9] bg-white px-3 text-[13px] text-black"
                                keyboardType={keyboard}
                                onChangeText={setter}
                                style={{ height: 40 }}
                                value={value}
                              />
                            </View>
                          ))}
                          <View className="gap-1">
                            <Text className="text-[11px] font-semibold text-[#6d7a88]">
                              Description
                            </Text>
                            <TextInput
                              className="rounded-[8px] border border-[#d9d9d9] bg-white px-3 pt-2.5 text-[13px] text-black"
                              multiline
                              onChangeText={setEditDescription}
                              style={{ height: 90, textAlignVertical: 'top' }}
                              value={editDescription}
                            />
                          </View>
                          <Pressable
                            className="items-center justify-center rounded-[8px] py-2.5"
                            disabled={editSaving}
                            onPress={() => void handleSaveBookInfo()}
                            style={{ backgroundColor: BRAND, opacity: editSaving ? 0.6 : 1 }}
                          >
                            <Text className="text-[13px] font-semibold text-[#070707]">
                              {editSaving ? 'Saving…' : 'Save changes'}
                            </Text>
                          </Pressable>
                        </View>
                      </KeyboardAvoidingView>
                    )}
                  </View>
                )}
              </>
            )}

            {/* Reviews sub-tab */}
            {infoSubTab === 'reviews' && (
              <>
                {myRating || userReview ? (
                  <View className="mx-5 mb-4 gap-3">
                    <View
                      className="rounded-[10px] border border-[#d9d9d9] p-4"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.74)',
                        elevation: 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                      }}
                    >
                      <View className="mb-3 flex-row items-center justify-between">
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                          <Text className="text-[13px] font-semibold text-[#28231c]">
                            My Review
                          </Text>
                          {userReviewSpoiler && (
                            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#fef3c7' }}>
                              <Text style={{ fontSize: 10, fontWeight: '600', color: '#92400e' }}>SPOILER</Text>
                            </View>
                          )}
                        </View>
                        {myRating ? <StaticStars rating={myRating} /> : null}
                      </View>
                      {userReview ? (
                        <ExpandableText
                          className="text-[13px] leading-[19px] text-[#444]"
                          text={userReview}
                        />
                      ) : (
                        <Text className="text-[13px] text-[#aaa]">
                          No written review yet.
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <View className="mx-5 items-center gap-2 py-10">
                    <Ionicons
                      color="#d9d9d9"
                      name="chatbubble-outline"
                      size={36}
                    />
                    <Text className="text-[14px] text-[#6d7a88]">
                      No review yet.
                    </Text>
                    <Text className="text-center text-[12px] text-[#aaa]">
                      Rate and review this book in the My Reading tab.
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Similar sub-tab */}
            {infoSubTab === 'similar' && (
              <View className="mx-5 items-center py-10">
                <Text className="text-[14px] text-[#6d7a88]">
                  Similar books coming soon.
                </Text>
              </View>
            )}
          </>
        )}

        {/* My Reading tab */}
        {activeTab === 'my-reading' && user && (
          <MyReadingTab
            onAddToLibrary={handleAddToLibrary}
            savedBook={savedBook}
            userId={user.id}
          />
        )}
        </View>
      </ScrollView>

      {/* ── Floating back / edit buttons (always on top) ────────────────── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: insets.top + 10, paddingBottom: 8, pointerEvents: 'box-none' }}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 4,
            backgroundColor: 'rgba(248,246,244,0.88)', borderRadius: 20,
            paddingHorizontal: 10, paddingVertical: 6,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons color="#28231c" name="chevron-back" size={20} />
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#28231c' }}>back</Text>
        </Pressable>
        {isCommunityBook && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
            <Pressable
              accessibilityLabel="Edit book"
              hitSlop={12}
              onPress={() => setEditModalVisible(true)}
              style={{ backgroundColor: 'rgba(248,246,244,0.88)', borderRadius: 18, padding: 7 }}
            >
              <Ionicons color="#513b3c" name="pencil-outline" size={18} />
            </Pressable>
            <Pressable
              accessibilityLabel="Delete book"
              hitSlop={12}
              onPress={handleDeleteBook}
              style={{ backgroundColor: 'rgba(248,246,244,0.88)', borderRadius: 18, padding: 7 }}
            >
              <Ionicons color="#e53935" name="trash-outline" size={18} />
            </Pressable>
          </View>
        )}
      </View>

      {/* ── Speed-dial pills ──────────────────────────────────────────── */}
      {fabOpen && (
        <View style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: 115 + insets.bottom,
          alignItems: 'center',
          gap: 10,
          zIndex: 20,
        }}>
          {([
            { icon: 'book-outline' as const,       label: 'Log pages',    tab: 'my-reading' as Tab, sub: undefined },
            { icon: 'star-outline' as const,        label: 'Write review', tab: 'info' as Tab,       sub: 'reviews' as InfoSubTab },
            { icon: 'chatbubble-outline' as const,  label: 'Add quote',    tab: 'my-reading' as Tab, sub: undefined },
          ]).map(({ icon, label, tab, sub }) => (
            <Pressable
              key={label}
              onPress={() => {
                setActiveTab(tab);
                if (sub) setInfoSubTab(sub);
                setFabOpen(false);
              }}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: '#28231c', borderRadius: 22,
                paddingVertical: 10, paddingHorizontal: 16,
                opacity: pressed ? 0.8 : 1,
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35, shadowRadius: 8, elevation: 12,
              })}
            >
              <Ionicons color="#c1eeff" name={icon} size={16} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {/* FAB button wrapper */}
      <View style={{
        position: 'absolute',
        left: 0, right: 0,
        bottom: 48 + insets.bottom,
        alignItems: 'center',
        zIndex: 20,
        pointerEvents: 'box-none',
      }}>
        <Pressable
          accessibilityLabel="Quick actions"
          onPress={() => setFabOpen((v) => !v)}
          style={({ pressed }) => ({
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: '#28231c',
            alignItems: 'center', justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35, shadowRadius: 10, elevation: 12,
          })}
        >
          <Ionicons color="#c1eeff" name={fabOpen ? 'close' : 'add'} size={28} />
        </Pressable>
      </View>

      <AppDialog
        buttons={dialog?.buttons ?? []}
        message={dialog?.message}
        onClose={() => setDialog(null)}
        title={dialog?.title ?? ''}
        visible={!!dialog}
      />
      {user && (
        <AddBookModal
          editBook={book}
          onBookEdited={handleBookEdited}
          onClose={() => setEditModalVisible(false)}
          userId={user.id}
          visible={editModalVisible}
        />
      )}
      <AddToShelfModal
        book={book}
        bookApiId={book.id}
        visible={addToLibraryVisible}
        onClose={() => setAddToLibraryVisible(false)}
      />

      {/* Cover image edit modal */}
      <Modal animationType="fade" transparent visible={coverModalVisible}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/50"
          onPress={() => setCoverModalVisible(false)}
        >
          <Pressable
            className="mx-6 w-full rounded-[16px] bg-white p-5"
            onPress={() => {}}
          >
            <Text className="mb-4 text-[15px] font-semibold text-[#28231c]">
              Change cover
            </Text>

            {/* Photo library button */}
            <Pressable
              className="mb-4 flex-row items-center justify-center gap-2 rounded-[10px] py-3"
              onPress={() => void pickAndUploadCover()}
              style={{ backgroundColor: BRAND }}
            >
              <Ionicons color="#070707" name="images-outline" size={18} />
              <Text className="text-[13px] font-semibold text-[#070707]">
                Choose from Library
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="mb-4 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-[#e8e8e8]" />
              <Text className="text-[11px] text-[#aaa]">or paste a URL</Text>
              <View className="h-px flex-1 bg-[#e8e8e8]" />
            </View>

            <TextInput
              className="rounded-[8px] border border-[#d9d9d9] bg-[#FFFFFFBD] px-3 text-[13px] text-black"
              onChangeText={setCoverInput}
              placeholder="https://…"
              placeholderTextColor="#aaa"
              style={{ height: 44 }}
              value={coverInput}
            />
            <View className="mt-4 flex-row gap-3">
              <Pressable
                className="flex-1 items-center justify-center rounded-[8px] border border-[#d9d9d9] py-2.5"
                onPress={() => setCoverModalVisible(false)}
              >
                <Text className="text-[13px] font-medium text-[#6d7a88]">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-[2] items-center justify-center rounded-[8px] py-2.5"
                disabled={coverSaving || !coverInput.trim()}
                onPress={() => void handleSaveCover()}
                style={{
                  backgroundColor: BRAND,
                  opacity: coverSaving || !coverInput.trim() ? 0.4 : 1,
                }}
              >
                <Text className="text-[13px] font-semibold text-[#070707]">
                  {coverSaving ? 'Saving…' : 'Save URL'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
