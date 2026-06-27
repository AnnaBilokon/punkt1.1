import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components/atoms/Text';
import { bookRepository } from '@/services/books/bookRepository';
import {
  findCommunityBookByIsbn,
  findCommunityBookByTitleAuthor,
  submitToLibrarium,
} from '@/services/books/communityBooks';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { GenreChips } from '../components/GenreChips';
import { LibrariumRulesSheet } from '../components/LibrariumRulesSheet';
import { TagInput } from '../components/TagInput';

type Props = {
  prefillTitle?: string | undefined;
};

type FormState = {
  author: string;
  coverImage: string;
  description: string;
  edition: string;
  genres: string[];
  isbn: string;
  language: 'English' | 'Swedish' | 'Other';
  pages: string;
  publisher: string;
  publishedYear: string;
  seriesName: string;
  seriesVolume: string;
  tags: string[];
  title: string;
};

function Field({
  label,
  hint,
  multiline,
  keyboardType,
  maxLength,
  ...rest
}: {
  hint?: string;
  keyboardType?: 'default' | 'number-pad';
  label: string;
  maxLength?: number;
  multiline?: boolean;
  onChangeText: (v: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-[15px] font-medium text-[#444]">{label}</Text>
      <TextInput
        className={`rounded-[10px] border border-[#d9d9d9] bg-[#f5f2ee] px-3 text-[15px] text-black ${multiline ? 'pt-2.5' : ''}`}
        keyboardType={keyboardType ?? 'default'}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        placeholderTextColor="#aaa"
        style={{
          height: multiline ? 110 : 48,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        {...rest}
      />
      {hint ? <Text className="text-[13px] leading-5 text-[#aaa]">{hint}</Text> : null}
    </View>
  );
}

const LANGUAGES = ['English', 'Swedish', 'Other'] as const;

const INITIAL_FORM: FormState = {
  author: '',
  coverImage: '',
  description: '',
  edition: '',
  genres: [],
  isbn: '',
  language: 'English',
  pages: '',
  publisher: '',
  publishedYear: '',
  seriesName: '',
  seriesVolume: '',
  tags: [],
  title: '',
};

export function LibrariumSubmitScreen({ prefillTitle }: Props) {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState<FormState>({
    ...INITIAL_FORM,
    title: prefillTitle ?? '',
  });
  const [coverLocalUri, setCoverLocalUri] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const set = <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  const setStr = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canSubmit =
    form.title.trim() &&
    form.author.trim() &&
    form.coverImage.trim() &&
    rulesAccepted &&
    !uploadingCover &&
    !submitting;

  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to upload a cover.');
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
      const fileName = `covers/${user?.id}-${Date.now()}.${ext}`;
      const mimeType = asset.mimeType ?? `image/${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('book-covers')
        .upload(fileName, blob, { contentType: mimeType, upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, coverImage: urlData.publicUrl }));
    } catch (e: unknown) {
      setCoverLocalUri(null);
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Could not upload image.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    const isbn = form.isbn.trim();
    const title = form.title.trim();
    const author = form.author.trim();

    if (isbn) {
      try {
        const existing = await findCommunityBookByIsbn(isbn);
        if (existing) {
          Alert.alert(
            'Already in the Librarium',
            `Good news — "${existing.title}" is already in the Librarium under this ISBN.`,
          );
          return;
        }
      } catch {
        // non-blocking
      }
    }

    try {
      const similar = await findCommunityBookByTitleAuthor(title, author);
      if (similar) {
        const proceed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Similar book exists',
            `"${similar.title}" by ${similar.author} is already in the Librarium. Is this a different edition or translation?`,
            [
              { onPress: () => resolve(false), style: 'cancel', text: 'Cancel' },
              { onPress: () => resolve(true), text: "Yes, it's different" },
            ],
          );
        });
        if (!proceed) return;
      }
    } catch {
      // non-blocking
    }

    setSubmitting(true);
    try {
      const book = await submitToLibrarium(user.id, {
        author,
        coverImage: form.coverImage.trim() || undefined,
        description: form.description.trim() || undefined,
        edition: form.edition.trim() || undefined,
        genres: form.genres,
        isbn: isbn || undefined,
        language: form.language,
        pages: form.pages ? parseInt(form.pages, 10) : undefined,
        publishedYear: form.publishedYear ? parseInt(form.publishedYear, 10) : undefined,
        publisher: form.publisher.trim() || undefined,
        seriesName: form.seriesName.trim() || undefined,
        seriesVolume:
          form.seriesName.trim() && form.seriesVolume
            ? parseInt(form.seriesVolume, 10)
            : undefined,
        tags: form.tags,
        title,
      });

      await bookRepository.addBook(user.id, book, 'want-to-read');

      router.back();
      setTimeout(() => {
        Alert.alert(
          'Submitted',
          "Your book is with our team. It usually takes up to 48 hours to review. We'll let you know.",
        );
      }, 400);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not submit book.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F8F6F4]"
    >
      {/* Header */}
      <View
        className="flex-row items-center gap-3 border-b border-[#e0dbd5] bg-white px-4"
        style={{ paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 14 }}
      >
        <Pressable accessibilityLabel="Go back" hitSlop={12} onPress={() => router.back()}>
          <Ionicons color="#28231c" name="arrow-back" size={22} />
        </Pressable>
        <Text className="text-[17px] font-semibold text-[#28231c]">Add to Librarium</Text>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={{ gap: 20, paddingBottom: 48, paddingHorizontal: 20, paddingTop: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro / mission */}
        <View className="rounded-2xl bg-white p-4 gap-3" style={{ borderColor: '#e0dbd5', borderWidth: 1 }}>
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#c1eeff]">
              <Ionicons color="#070707" name="library-outline" size={17} />
            </View>
            <Text className="text-[16px] font-bold text-[#28231c]">The Librarium</Text>
          </View>
          <Text className="text-[15px] leading-6 text-[#655356]">
            A community-built collection of books that exist in the world but aren't in any
            database yet — Swedish titles, independent publishers, regional editions that Google
            Books has never heard of.
          </Text>
          <Text className="text-[15px] leading-6 text-[#655356]">
            Every book here was placed by a reader who knew it and thought it deserved to be
            found. Our team reviews each submission before it goes live. If approved, you'll
            earn <Text className="font-semibold text-[#28231c]">+150 Marks</Text> and the
            book will carry your name.
          </Text>
        </View>

        {/* Section: The book */}
        <SectionHeader label="The book" />

        <Field
          hint="Use the full title as it appears on the cover, including subtitle."
          label="Title *"
          onChangeText={setStr('title')}
          placeholder="Full title, including subtitle"
          value={form.title}
        />
        <Field
          hint="Spell names exactly as printed, including diacritics (å, ö, é…)."
          label="Author(s) *"
          onChangeText={setStr('author')}
          placeholder="Author name(s)"
          value={form.author}
        />

        {/* Cover image */}
        <View className="gap-1.5">
          <Text className="text-[15px] font-medium text-[#444]">Cover image *</Text>
          <Pressable
            accessibilityLabel="Pick cover image"
            accessibilityRole="button"
            className="flex-row items-center gap-3 rounded-[10px] border border-[#d9d9d9] bg-[#f5f2ee] px-3"
            onPress={pickCoverImage}
            style={{ height: 64 }}
          >
            {coverLocalUri ? (
              <Image
                resizeMode="cover"
                source={{ uri: form.coverImage || coverLocalUri }}
                style={{ borderRadius: 4, height: 48, width: 34 }}
              />
            ) : (
              <View className="h-12 w-9 items-center justify-center rounded-[4px] bg-[#e2f5ff]">
                <Ionicons color="#655356" name="image-outline" size={22} />
              </View>
            )}
            <View className="flex-1">
              {uploadingCover ? (
                <Text className="text-[15px] text-[#655356]">Uploading…</Text>
              ) : coverLocalUri ? (
                <Text className="text-[15px] text-[#655356]">Image selected — tap to change</Text>
              ) : (
                <>
                  <Text className="text-[15px] text-[#6d7a88]">Tap to choose from photo library</Text>
                  <Text className="mt-0.5 text-[13px] text-[#aaa]">Or paste a URL below</Text>
                </>
              )}
            </View>
            <Ionicons color="#aaa" name="chevron-forward" size={16} />
          </Pressable>
          {!coverLocalUri && (
            <TextInput
              className="rounded-[10px] border border-[#d9d9d9] bg-[#f5f2ee] px-3 text-[14px] text-black"
              onChangeText={setStr('coverImage')}
              placeholder="https://…"
              placeholderTextColor="#aaa"
              style={{ height: 44 }}
              value={form.coverImage}
            />
          )}
          <Text className="text-[13px] leading-5 text-[#aaa]">
            Photograph the actual cover — no screenshots or low-res thumbnails. Full cover
            visible, no fingers or shadows. Min 400×600px · JPG, PNG or WEBP.
          </Text>
        </View>

        {/* Section: Publication details */}
        <SectionHeader label="Publication details" />

        <Field
          hint="The company that published this specific edition."
          label="Publisher"
          onChangeText={setStr('publisher')}
          placeholder="Publisher name"
          value={form.publisher}
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field
              hint="Year this edition was published, not the original if it's a reprint."
              keyboardType="number-pad"
              label="Year"
              onChangeText={setStr('publishedYear')}
              placeholder="2024"
              value={form.publishedYear}
            />
          </View>
          <View className="flex-1">
            <Field
              hint="Check the barcode. Leave blank if unsure — don't guess."
              label="ISBN"
              onChangeText={setStr('isbn')}
              placeholder="978-…"
              value={form.isbn}
            />
          </View>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field
              keyboardType="number-pad"
              label="Pages"
              onChangeText={setStr('pages')}
              placeholder="320"
              value={form.pages}
            />
          </View>
          <View className="flex-1">
            <Field
              hint="e.g. First, Revised, Second."
              label="Edition"
              onChangeText={setStr('edition')}
              placeholder="First, Revised…"
              value={form.edition}
            />
          </View>
        </View>

        {/* Section: Language */}
        <SectionHeader label="Language" />

        <View className="gap-1">
          <Text className="text-[15px] font-medium text-[#444]">Language of this edition *</Text>
          <Text className="text-[13px] leading-5 text-[#aaa]">
            The language of the copy you have in hand, not the original if it's a translation.
          </Text>
          <View className="mt-1 flex-row gap-2">
            {LANGUAGES.map((lang) => {
              const active = form.language === lang;
              return (
                <Pressable
                  key={lang}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  className="flex-1 items-center rounded-[10px] py-3"
                  onPress={() => set('language')(lang)}
                  style={{ backgroundColor: active ? '#c1eeff' : '#e2f5ff' }}
                >
                  <Text
                    className="text-[15px] font-medium"
                    style={{ color: active ? '#070707' : '#655356' }}
                  >
                    {lang}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section: Genre */}
        <SectionHeader label="Genre" />

        <View className="gap-1">
          <Text className="text-[15px] font-medium text-[#444]">Genre(s) — optional</Text>
          <Text className="text-[13px] leading-5 text-[#aaa]">
            Leave blank if unsure. A missing genre is better than a wrong one.
          </Text>
          <View className="mt-1">
            <GenreChips onChange={set('genres')} selected={form.genres} />
          </View>
        </View>

        {/* Section: Series */}
        <SectionHeader label="Series" />

        <Field
          hint="Leave blank if this book is not part of a series."
          label="Series name"
          onChangeText={setStr('seriesName')}
          placeholder="e.g. The Witcher, Millennium…"
          value={form.seriesName}
        />
        {form.seriesName.trim() ? (
          <Field
            hint="Which number in the series is this book?"
            keyboardType="number-pad"
            label="Volume number"
            onChangeText={setStr('seriesVolume')}
            placeholder="1"
            value={form.seriesVolume}
          />
        ) : null}

        {/* Section: Description */}
        <SectionHeader label="Description" />

        <View className="gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-medium text-[#444]">Book synopsis — optional</Text>
            <Text className="text-[13px] text-[#aaa]">{form.description.length} / 2000</Text>
          </View>
          <Text className="text-[13px] leading-5 text-[#aaa]">
            Use the publisher's description or back-cover copy. No personal opinions or reviews.
          </Text>
          <TextInput
            className="mt-1 rounded-[10px] border border-[#d9d9d9] bg-[#f5f2ee] px-3 pt-2.5 text-[15px] text-black"
            maxLength={2000}
            multiline
            numberOfLines={5}
            onChangeText={setStr('description')}
            placeholder="Copy from the back cover or dust jacket…"
            placeholderTextColor="#aaa"
            style={{ height: 120, textAlignVertical: 'top' }}
            value={form.description}
          />
        </View>

        {/* Section: Tags */}
        <SectionHeader label="Tags" />

        <View className="gap-1">
          <Text className="text-[15px] font-medium text-[#444]">Tags — optional</Text>
          <Text className="text-[13px] leading-5 text-[#aaa]">
            Short labels that help readers discover this book beyond genre — e.g. "award winner",
            "debut novel", "set in Sweden", "slow burn". Up to 10. Press Enter or comma to add.
          </Text>
          <View className="mt-1">
            <TagInput maxTags={10} onChange={set('tags')} tags={form.tags} />
          </View>
        </View>

        {/* Rules checkbox — link and checkbox are separate to avoid touch conflict */}
        <View className="mt-2 rounded-2xl border border-[#a8d8f0] bg-[#e2f5ff] p-4 gap-3">
          <TouchableOpacity
            accessibilityLabel="Read Librarium submission rules"
            className="flex-row items-center gap-2"
            onPress={() => setRulesVisible(true)}
          >
            <Ionicons color="#28231c" name="document-text-outline" size={17} />
            <Text className="text-[15px] font-semibold text-[#28231c] underline">
              Read the Librarium submission rules
            </Text>
            <Ionicons color="#655356" name="chevron-forward" size={15} />
          </TouchableOpacity>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rulesAccepted }}
            className="flex-row items-start gap-3"
            onPress={() => setRulesAccepted((v) => !v)}
          >
            <View
              className="mt-0.5 h-5 w-5 items-center justify-center rounded"
              style={{
                backgroundColor: rulesAccepted ? '#c1eeff' : 'white',
                borderColor: rulesAccepted ? '#070707' : '#a8d8f0',
                borderWidth: 1.5,
              }}
            >
              {rulesAccepted && <Ionicons color="#070707" name="checkmark" size={13} />}
            </View>
            <Text className="flex-1 text-[15px] leading-6 text-[#28231c]">
              I've read the rules and confirm that the information I've provided is accurate to
              the best of my knowledge.
            </Text>
          </Pressable>
        </View>

        {/* Submit button */}
        <Pressable
          accessibilityLabel="Submit book to Librarium"
          accessibilityRole="button"
          className="items-center rounded-full py-4"
          disabled={!canSubmit}
          onPress={handleSubmit}
          style={{ backgroundColor: '#c1eeff', opacity: canSubmit ? 1 : 0.4 }}
        >
          <Text className="text-[16px] font-semibold text-[#070707]">
            {submitting ? 'Submitting…' : 'Submit to Librarium'}
          </Text>
        </Pressable>
      </ScrollView>

      <LibrariumRulesSheet onClose={() => setRulesVisible(false)} visible={rulesVisible} />
    </KeyboardAvoidingView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View className="border-b border-[#e0dbd5] pb-1">
      <Text className="text-[12px] font-semibold uppercase tracking-widest text-[#655356]">
        {label}
      </Text>
    </View>
  );
}
