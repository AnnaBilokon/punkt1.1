import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { AppDialog, type DialogButton } from '@/components/molecules/AppDialog';
import { useUserBooks } from '@/features/library/hooks/useUserBooks';
import { useAuthStore } from '@/store/authStore';
import { useBookStore } from '@/store/bookStore';
import type { Book, BookStatus, ReadingDataUpdate } from '@/types';

type Tab = 'info' | 'my-reading';
type InfoSubTab = 'about' | 'reviews' | 'similar';

type BookDetailScreenProps = {
  book: Book;
};

const BRAND = '#7D5BA6';

const SHELVES: { label: string; value: BookStatus }[] = [
  { label: 'Want to Read', value: 'want-to-read' },
  { label: 'Reading', value: 'reading' },
  { label: 'Finished', value: 'completed' },
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
      <Text className="text-[12px] font-bold text-[#15151e]">{label}</Text>
      <Text className="text-[12px] text-[#15151e]">{value}</Text>
    </View>
  );
}

function StaticStars({ rating }: { rating: number }) {
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
      <Text className="text-[12px] font-semibold text-[#15151e]">{label}</Text>
      <Pressable
        className="flex-row items-center rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9] px-3"
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
  const saveReadingData = useBookStore((s) => s.saveReadingData);
  const [localDialog, setLocalDialog] = useState<LocalDialogConfig>(null);

  const [myRating, setMyRating] = useState(savedBook?.myRating ?? 0);
  const [pagesRead, setPagesRead] = useState(
    savedBook?.progress ? String(savedBook.progress) : '',
  );
  const [startedAt, setStartedAt] = useState(
    savedBook?.startedAt ? isoToDisplay(savedBook.startedAt) : '',
  );
  const [finishedAt, setFinishedAt] = useState(
    savedBook?.finishedAt ? isoToDisplay(savedBook.finishedAt) : '',
  );
  const [shelf, setShelf] = useState<BookStatus | undefined>(savedBook?.status);
  const [review, setReview] = useState(savedBook?.review ?? '');
  const [note, setNote] = useState(savedBook?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [activePicker, setActivePicker] = useState<
    'started' | 'finished' | null
  >(null);

  const getPickerDate = () => {
    const iso =
      activePicker === 'started'
        ? displayToIso(startedAt)
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
      else setFinishedAt(display);
    }
  };

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
          <Text className="text-[13px] font-semibold text-white">
            Add to Library
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: ReadingDataUpdate = {
        finishedAt: displayToIso(finishedAt),
        myRating: myRating > 0 ? myRating : null,
        note: note.trim() || null,
        progress: pagesRead ? parseInt(pagesRead, 10) : 0,
        review: review.trim() || null,
        startedAt: displayToIso(startedAt),
        ...(shelf !== undefined ? { status: shelf } : {}),
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
    setMyRating(savedBook.myRating ?? 0);
    setPagesRead(savedBook.progress ? String(savedBook.progress) : '');
    setStartedAt(savedBook.startedAt ? isoToDisplay(savedBook.startedAt) : '');
    setFinishedAt(
      savedBook.finishedAt ? isoToDisplay(savedBook.finishedAt) : '',
    );
    setShelf(savedBook.status);
    setReview(savedBook.review ?? '');
    setNote(savedBook.note ?? '');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="gap-5 px-5 pb-6 pt-1">
        {/* Rate */}
        <View className="gap-2">
          <Text className="text-[13px] font-semibold text-[#15151e]">Rate</Text>
          <InteractiveStars onChange={setMyRating} value={myRating} />
        </View>

        {/* Pages read */}
        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold text-[#15151e]">
            Pages read
          </Text>
          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9] px-3 text-[14px] text-black"
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
                      <Text className="text-[15px] font-semibold text-[#7D5BA6]">
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
          <Text className="text-[13px] font-semibold text-[#15151e]">
            Review
          </Text>
          <TextInput
            className="rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9] px-3 pt-2.5 text-[13px] text-black"
            multiline
            numberOfLines={4}
            onChangeText={setReview}
            placeholder="Write your review..."
            placeholderTextColor="#aaa"
            style={{ height: 110, textAlignVertical: 'top' }}
            value={review}
          />
        </View>

        {/* Bookshelf */}
        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold text-[#15151e]">
            Bookshelf
          </Text>
          <View
            className="flex-row rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9]"
            style={{ height: 40 }}
          >
            {SHELVES.map((s, index) => {
              const isActive = shelf === s.value;
              return (
                <Pressable
                  key={s.value}
                  className="flex-1 items-center justify-center"
                  onPress={() => setShelf(s.value)}
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
                    className={`text-[11px] font-medium ${isActive ? 'text-white' : 'text-[#444]'}`}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Note */}
        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold text-[#15151e]">Note</Text>
          <TextInput
            className="rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9] px-3 pt-2.5 text-[13px] text-black"
            multiline
            numberOfLines={3}
            onChangeText={setNote}
            placeholder="Note something..."
            placeholderTextColor="#aaa"
            style={{ height: 80, textAlignVertical: 'top' }}
            value={note}
          />
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
            <Text className="text-[14px] font-semibold text-white">
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>
      <AppDialog
        buttons={localDialog?.buttons ?? []}
        message={localDialog?.message}
        onClose={() => setLocalDialog(null)}
        title={localDialog?.title ?? ''}
        visible={!!localDialog}
      />
    </KeyboardAvoidingView>
  );
}

type DialogConfig = {
  buttons: DialogButton[];
  message?: string;
  title: string;
} | null;

export function BookDetailScreen({ book }: BookDetailScreenProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [infoSubTab, setInfoSubTab] = useState<InfoSubTab>('about');
  const addBook = useBookStore((s) => s.addBook);
  const user = useAuthStore((s) => s.user);
  const { data: userBooks = [] } = useUserBooks(user?.id ?? null);
  const savedBook = userBooks.find((b) => b.id === book.id);
  const isInLibrary = !!savedBook;

  const removeBook = useBookStore((s) => s.removeBook);
  const [dialog, setDialog] = useState<DialogConfig>(null);

  const handleAddToLibrary = () => {
    if (!user) return;
    setDialog({
      title: `Add "${book.title}"`,
      message: 'Choose a shelf:',
      buttons: [
        {
          label: 'Want to Read',
          onPress: () => void addBook(user.id, book, 'want-to-read'),
        },
        {
          label: 'Currently Reading',
          onPress: () => void addBook(user.id, book, 'reading'),
        },
        {
          label: 'Finished',
          onPress: () => void addBook(user.id, book, 'completed'),
        },
        { label: 'Cancel', type: 'cancel', onPress: () => {} },
      ],
    });
  };

  const handleRemoveFromLibrary = () => {
    if (!user) return;
    setDialog({
      title: 'Remove from library?',
      message: `"${book.title}" will be removed from your shelves.`,
      buttons: [
        {
          label: 'Remove',
          type: 'destructive',
          onPress: () => void removeBook(user.id, book.id),
        },
        { label: 'Cancel', type: 'cancel', onPress: () => {} },
      ],
    });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Book Info' },
    { id: 'my-reading', label: 'My Reading' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="flex-row items-center gap-1 px-5 py-3"
          onPress={() => router.back()}
        >
          <Ionicons color="#212121" name="chevron-back" size={18} />
          <Text className="text-[11px] text-black">back</Text>
        </Pressable>

        {/* Book header */}
        <View className="flex-row gap-4 px-5 pb-3">
          {book.coverImage ? (
            <Image
              className="h-[190px] w-[139px] rounded-[12px]"
              resizeMode="cover"
              source={{ uri: book.coverImage }}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}
            />
          ) : (
            <View className="h-[190px] w-[139px] items-center justify-center rounded-[12px] bg-[#f1edf8]">
              <Ionicons color="#7D5BA6" name="book-outline" size={48} />
            </View>
          )}
          <View className="flex-1 justify-start gap-2 pt-1">
            <Text className="text-[16px] font-semibold leading-tight text-black">
              {book.title}
            </Text>
            <Text className="text-[14px] text-[#6d7a88]">by {book.author}</Text>
            <StaticStars rating={book.rating} />
            {book.pages > 0 && (
              <Text className="text-[12px] text-[#212121]">
                {book.pages} pages
              </Text>
            )}
            {book.publishedYear > 0 && (
              <Text className="text-[12px] text-[#212121]">
                Published {book.publishedYear}
              </Text>
            )}
            {book.genres.length > 0 && (
              <Text className="text-[12px] text-[#212121]">
                {book.genres.join(', ')}
              </Text>
            )}
            <Pressable
              accessibilityLabel={isInLibrary ? 'In Library' : 'Add to Library'}
              accessibilityRole="button"
              className="mt-1 items-center justify-center rounded-[8px] py-2"
              onPress={() =>
                isInLibrary ? handleRemoveFromLibrary() : handleAddToLibrary()
              }
              style={
                isInLibrary
                  ? {
                      backgroundColor: '#fff',
                      borderWidth: 1,
                      borderColor: BRAND,
                    }
                  : { backgroundColor: BRAND }
              }
            >
              <Text
                className={`text-[13px] font-bold ${isInLibrary ? 'text-[#7D5BA6]' : 'text-white'}`}
              >
                {isInLibrary ? '✓ In Library' : '+ Add to Library'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 2-tab bar */}
        <View
          className="mx-5 mb-4 flex-row rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9]"
          style={{ height: 41 }}
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityLabel={tab.label}
                accessibilityRole="tab"
                className="flex-1 items-center justify-center"
                onPress={() => setActiveTab(tab.id)}
                style={
                  isActive && {
                    backgroundColor: '#a0c4a7',
                    borderTopLeftRadius: index === 0 ? 7 : 0,
                    borderBottomLeftRadius: index === 0 ? 7 : 0,
                    borderTopRightRadius: index === 1 ? 7 : 0,
                    borderBottomRightRadius: index === 1 ? 7 : 0,
                  }
                }
              >
                <Text
                  className={`text-[14px] ${isActive ? 'text-white' : 'text-[#212121]'}`}
                >
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
            <View
              className="mx-5 mb-4 flex-row rounded-[8px] border border-[#d9d9d9] bg-[#f9f9f9]"
              style={{ height: 38 }}
            >
              {(['about', 'reviews', 'similar'] as InfoSubTab[]).map(
                (sub, index) => {
                  const isActive = infoSubTab === sub;
                  const label =
                    sub === 'similar'
                      ? 'Similar ✨'
                      : sub.charAt(0).toUpperCase() + sub.slice(1);
                  return (
                    <Pressable
                      key={sub}
                      accessibilityLabel={label}
                      accessibilityRole="tab"
                      className="flex-1 items-center justify-center"
                      onPress={() => setInfoSubTab(sub)}
                      style={
                        isActive && {
                          backgroundColor: '#a0c4a7',
                          borderTopLeftRadius: index === 0 ? 7 : 0,
                          borderBottomLeftRadius: index === 0 ? 7 : 0,
                          borderTopRightRadius: index === 2 ? 7 : 0,
                          borderBottomRightRadius: index === 2 ? 7 : 0,
                        }
                      }
                    >
                      <Text
                        className={`text-[13px] ${
                          isActive ? 'text-white' : 'text-[#212121]'
                        }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* About sub-tab */}
            {infoSubTab === 'about' && (
              <>
                {/* Description card */}
                <View
                  className="mx-5 mb-4 rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] p-5"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.16,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text className="mb-2 text-[14px] font-semibold text-[#15151e]">
                    Description
                  </Text>
                  <Text className="mb-4 text-[12px] leading-[16px] text-[#15151e]">
                    {book.description || 'No description available.'}
                  </Text>
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
                    </View>
                    <View className="flex-1 gap-3">
                      <MetaRow label="Language" value="English" />
                      <MetaRow
                        label="Categories"
                        value={
                          book.genres.length ? book.genres.join(', ') : '—'
                        }
                      />
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Reviews sub-tab */}
            {infoSubTab === 'reviews' && (
              <View className="mx-5 items-center py-10">
                <Text className="text-[14px] text-[#6d7a88]">
                  No reviews yet.
                </Text>
              </View>
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
      </ScrollView>
      <AppDialog
        buttons={dialog?.buttons ?? []}
        message={dialog?.message}
        onClose={() => setDialog(null)}
        title={dialog?.title ?? ''}
        visible={!!dialog}
      />
    </SafeAreaView>
  );
}
