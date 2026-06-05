import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/atoms/Text';
import {
  findCommunityBookByTitleAuthor,
  submitCommunityBook,
  updateCommunityBook,
} from '@/services/books/communityBooks';
import { supabase } from '@/services/supabase';
import type { Book, BookStatus } from '@/types';

type Props = {
  editBook?: Book | undefined;
  onBookEdited?: (book: Book) => void;
  onBookSaved?: (book: Book, status: BookStatus) => void;
  onClose: () => void;
  userId: string;
  visible: boolean;
};

type FormState = {
  author: string;
  coverImage: string;
  description: string;
  genres: string;
  isbn: string;
  language: string;
  pages: string;
  publishedYear: string;
  publisher: string;
  title: string;
};

const toRawCommunityId = (bookId: string) => bookId.replace(/^custom-/, '');

const INITIAL_FORM: FormState = {
  author: '',
  coverImage: '',
  description: '',
  genres: '',
  isbn: '',
  language: '',
  pages: '',
  publishedYear: '',
  publisher: '',
  title: '',
};

const bookToForm = (book: Book): FormState => ({
  author: book.author,
  coverImage: book.coverImage,
  description: book.description,
  genres: book.genres.join(', '),
  isbn: book.isbn ?? '',
  language: book.language ?? '',
  pages: book.pages > 0 ? String(book.pages) : '',
  publishedYear: book.publishedYear > 0 ? String(book.publishedYear) : '',
  publisher: book.publisher ?? '',
  title: book.title,
});

export const AddBookModal = ({
  visible,
  onClose,
  userId,
  editBook,
  onBookEdited,
  onBookSaved,
}: Props) => {
  const isEditing = !!editBook;

  const [form, setForm] = useState<FormState>(
    editBook ? bookToForm(editBook) : INITIAL_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [coverLocalUri, setCoverLocalUri] = useState<string | null>(
    editBook?.coverImage ?? null,
  );
  const [uploadingCover, setUploadingCover] = useState(false);

  // Sync form when editBook changes (e.g. modal opens for a different book)
  useEffect(() => {
    if (visible) {
      setForm(editBook ? bookToForm(editBook) : INITIAL_FORM);
      setCoverLocalUri(editBook?.coverImage ?? null);
    }
  }, [visible, editBook]);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Allow access to your photo library to upload a cover.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [2, 3],
      mediaTypes: 'images',
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setCoverLocalUri(asset.uri);
    setUploadingCover(true);

    try {
      const ext = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `covers/${userId}-${Date.now()}.${ext}`;
      const mimeType = asset.mimeType ?? `image/${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('book-covers')
        .upload(fileName, blob, { contentType: mimeType, upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName);

      setForm((prev) => ({ ...prev, coverImage: urlData.publicUrl }));
    } catch (e: unknown) {
      setCoverLocalUri(null);
      Alert.alert(
        'Upload failed',
        e instanceof Error ? e.message : 'Could not upload image.',
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.author.trim() || !form.coverImage.trim()) {
      Alert.alert(
        'Required',
        'Title, Author, and Cover are required before saving.',
      );
      return;
    }

    const genres = form.genres
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const input = {
      author: form.author.trim(),
      coverImage: form.coverImage.trim() || undefined,
      description: form.description.trim() || undefined,
      genres: genres.length ? genres : undefined,
      isbn: form.isbn.trim() || undefined,
      language: form.language.trim() || undefined,
      pages: form.pages ? parseInt(form.pages, 10) : undefined,
      publishedYear: form.publishedYear
        ? parseInt(form.publishedYear, 10)
        : undefined,
      publisher: form.publisher.trim() || undefined,
      title: form.title.trim(),
    };

    setSaving(true);
    try {
      let book: Book;
      const editingRawId =
        isEditing && editBook ? toRawCommunityId(editBook.id) : undefined;
      const existingBook = await findCommunityBookByTitleAuthor(
        input.title,
        input.author,
        editingRawId,
      );

      if (existingBook) {
        book = await updateCommunityBook(
          toRawCommunityId(existingBook.id),
          input,
        );
      } else if (isEditing && editBook) {
        book = await updateCommunityBook(editingRawId!, input);
      } else {
        book = await submitCommunityBook(userId, input);
      }

      setForm(INITIAL_FORM);
      setCoverLocalUri(null);
      onBookEdited?.(book);
      onClose();

      // Ask if user wants to add the book to a shelf
      if (onBookSaved) {
        Alert.alert(
          existingBook
            ? 'Book already existed'
            : isEditing
              ? 'Book updated!'
              : 'Book saved!',
          'Do you want to add it to a shelf?',
          [
            { style: 'cancel', text: 'Not now' },
            {
              text: 'TBR',
              onPress: () => onBookSaved(book, 'want-to-read'),
            },
            {
              text: 'Currently Reading',
              onPress: () => onBookSaved(book, 'reading'),
            },
            {
              text: 'Finished',
              onPress: () => onBookSaved(book, 'completed'),
            },
          ],
        );
      }
    } catch (e: unknown) {
      Alert.alert(
        'Error',
        e instanceof Error ? e.message : 'Could not save book.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />
        <View className="rounded-t-[20px] bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pb-3 pt-5">
            <Text className="text-[18px] font-bold text-black">
              {isEditing ? 'Edit Book' : 'Add a Book'}
            </Text>
            <Pressable
              accessibilityLabel="Close"
              hitSlop={12}
              onPress={onClose}
            >
              <Ionicons color="#6d7a88" name="close" size={24} />
            </Pressable>
          </View>

          <ScrollView
            bounces={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-4 px-5 pt-2">
              <Field
                label="Title *"
                onChangeText={set('title')}
                placeholder="Book title"
                value={form.title}
              />
              <Field
                label="Author *"
                onChangeText={set('author')}
                placeholder="Author name"
                value={form.author}
              />

              {/* Cover Image */}
              <View className="gap-1">
                <Text className="text-[13px] font-medium text-[#444]">
                  Cover Image *
                </Text>
                <Pressable
                  accessibilityLabel="Pick cover image from library"
                  accessibilityRole="button"
                  className="flex-row items-center gap-3 rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-3"
                  onPress={pickCoverImage}
                  style={{ height: 60 }}
                >
                  {coverLocalUri ? (
                    <Image
                      resizeMode="cover"
                      source={{ uri: form.coverImage || coverLocalUri || '' }}
                      style={{ borderRadius: 4, height: 44, width: 32 }}
                    />
                  ) : (
                    <View className="h-11 w-8 items-center justify-center rounded-[4px] bg-[#ede7f6]">
                      <Ionicons
                        color="#7851A9"
                        name="image-outline"
                        size={20}
                      />
                    </View>
                  )}
                  <View className="flex-1">
                    {uploadingCover ? (
                      <Text className="text-[13px] text-[#7851A9]">
                        Uploading…
                      </Text>
                    ) : coverLocalUri ? (
                      <Text className="text-[13px] text-[#7851A9]">
                        Image selected — tap to change
                      </Text>
                    ) : (
                      <Text className="text-[13px] text-[#6d7a88]">
                        Tap to choose from photo library
                      </Text>
                    )}
                    {!coverLocalUri && (
                      <Text className="mt-0.5 text-[11px] text-[#aaa]">
                        Or paste a URL below
                      </Text>
                    )}
                  </View>
                  <Ionicons color="#aaa" name="chevron-forward" size={16} />
                </Pressable>
                {!coverLocalUri && (
                  <TextInput
                    className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-3 text-[14px] text-black"
                    onChangeText={set('coverImage')}
                    placeholder="https://..."
                    placeholderTextColor="#aaa"
                    style={{ height: 44 }}
                    value={form.coverImage}
                  />
                )}
              </View>

              <Field
                label="Genres (comma-separated)"
                onChangeText={set('genres')}
                placeholder="Fiction, Drama, Historical"
                value={form.genres}
              />
              <Field
                label="Publisher"
                onChangeText={set('publisher')}
                placeholder="Penguin Books"
                value={form.publisher}
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Field
                    label="Language"
                    onChangeText={set('language')}
                    placeholder="English"
                    value={form.language}
                  />
                </View>
                <View className="flex-1">
                  <Field
                    label="ISBN"
                    onChangeText={set('isbn')}
                    placeholder="978-3-16-148410-0"
                    value={form.isbn}
                  />
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Field
                    keyboardType="number-pad"
                    label="Pages"
                    onChangeText={set('pages')}
                    placeholder="320"
                    value={form.pages}
                  />
                </View>
                <View className="flex-1">
                  <Field
                    keyboardType="number-pad"
                    label="Year"
                    onChangeText={set('publishedYear')}
                    placeholder="2023"
                    value={form.publishedYear}
                  />
                </View>
              </View>
              <Field
                label="Description"
                maxLength={600}
                multiline
                onChangeText={set('description')}
                placeholder="Short description..."
                value={form.description}
              />

              <Pressable
                accessibilityLabel={isEditing ? 'Save changes' : 'Save book'}
                accessibilityRole="button"
                className="mt-2 items-center rounded-[10px] bg-[#7851A9] py-3.5"
                disabled={saving || uploadingCover}
                onPress={handleSave}
                style={{ opacity: saving || uploadingCover ? 0.6 : 1 }}
              >
                <Text className="text-[15px] font-semibold text-white">
                  {saving
                    ? 'Saving…'
                    : isEditing
                      ? 'Save Changes'
                      : 'Save to Database'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

function Field({
  label,
  multiline,
  keyboardType,
  maxLength,
  ...rest
}: {
  keyboardType?: 'default' | 'number-pad';
  label: string;
  maxLength?: number;
  multiline?: boolean;
  onChangeText: (v: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View className="gap-1">
      <Text className="text-[13px] font-medium text-[#444]">{label}</Text>
      <TextInput
        className={`rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-3 text-[14px] text-black ${multiline ? 'pt-2.5' : ''}`}
        keyboardType={keyboardType ?? 'default'}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={{
          height: multiline ? 90 : 44,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        {...rest}
      />
    </View>
  );
}
