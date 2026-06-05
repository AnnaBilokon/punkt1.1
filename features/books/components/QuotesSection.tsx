import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/atoms/Text';
import {
  useBookQuotes,
  useBookQuotesActions,
} from '@/features/library/hooks/useBookQuotes';
import type { BookQuote } from '@/types';

const BRAND = '#7851A9';

const QuoteCard = memo(
  ({
    onDelete,
    quote,
  }: {
    onDelete: () => void;
    quote: BookQuote;
  }) => (
    <View className="rounded-[12px] border border-[#e8e8e8] bg-white px-4 py-3">
      <Text
        className="text-[14px] italic leading-[21px] text-[#333]"
        variant="body"
      >
        &ldquo;{quote.text}&rdquo;
      </Text>
      <View className="mt-2 flex-row items-center justify-between">
        {quote.pageNumber ? (
          <Text className="text-[11px] text-[#9b9b9b]" variant="caption">
            p. {quote.pageNumber}
          </Text>
        ) : (
          <View />
        )}
        <Pressable
          hitSlop={10}
          onPress={onDelete}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Ionicons color="#c0c0c0" name="trash-outline" size={14} />
        </Pressable>
      </View>
    </View>
  ),
);
QuoteCard.displayName = 'QuoteCard';

type AddQuoteSheetProps = {
  onClose: () => void;
  onSave: (text: string, pageNumber?: number) => Promise<void>;
  visible: boolean;
};

const AddQuoteSheet = memo(({ onClose, onSave, visible }: AddQuoteSheetProps) => {
  const [text, setText] = useState('');
  const [pageInput, setPageInput] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setText('');
    setPageInput('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const page = pageInput ? parseInt(pageInput, 10) : undefined;
      await onSave(text.trim(), page);
      reset();
      onClose();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={handleClose} transparent visible={visible}>
      <Pressable className="absolute inset-0 bg-black/40" onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="absolute bottom-0 left-0 right-0"
      >
        <View className="rounded-t-[28px] bg-white px-6 pb-10 pt-3" style={{ gap: 16 }}>
          <View className="h-1 w-10 self-center rounded-full bg-[#d9d9d9]" />
          <Text className="text-[18px] font-semibold text-black" variant="body">
            Save a quote
          </Text>

          <View className="gap-1.5">
            <Text className="text-[12px] font-semibold text-[#15151e]" variant="body">Quote</Text>
            <TextInput
              autoFocus
              className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-3 pt-2.5 text-[14px] text-black"
              maxLength={500}
              multiline
              numberOfLines={4}
              onChangeText={setText}
              placeholder="Type or paste the quote…"
              placeholderTextColor="#aaa"
              style={{ height: 100, textAlignVertical: 'top' }}
              value={text}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-[12px] font-semibold text-[#15151e]" variant="body">
              Page{' '}
              <Text className="font-normal text-[#9b9b9b]" variant="body">(optional)</Text>
            </Text>
            <TextInput
              className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-3 text-[14px] text-black"
              keyboardType="number-pad"
              maxLength={5}
              onChangeText={setPageInput}
              placeholder="e.g. 142"
              placeholderTextColor="#aaa"
              style={{ height: 44 }}
              value={pageInput}
            />
          </View>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 items-center justify-center rounded-[10px] border border-[#d9d9d9] py-3"
              onPress={handleClose}
            >
              <Text className="text-[14px] font-medium text-[#6d7a88]" variant="body">Cancel</Text>
            </Pressable>
            <Pressable
              className="flex-[2] items-center justify-center rounded-[10px] py-3"
              disabled={saving || !text.trim()}
              onPress={() => void handleSave()}
              style={{ backgroundColor: BRAND, opacity: saving || !text.trim() ? 0.5 : 1 }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-[14px] font-semibold text-white" variant="body">Save quote</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});
AddQuoteSheet.displayName = 'AddQuoteSheet';

type Props = {
  bookApiId: string;
  userId: string;
};

export const QuotesSection = memo(({ bookApiId, userId }: Props) => {
  const { data: quotes = [], isLoading } = useBookQuotes(bookApiId, userId);
  const { addQuote, deleteQuote } = useBookQuotesActions(bookApiId, userId);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleDelete = (quote: BookQuote) => {
    Alert.alert(
      'Delete quote?',
      'This quote will be permanently removed.',
      [
        { style: 'destructive', text: 'Delete', onPress: () => void deleteQuote(quote.id) },
        { style: 'cancel', text: 'Cancel' },
      ],
    );
  };

  return (
    <View className="gap-3 px-5 pb-2 pt-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-[15px] font-semibold text-black" variant="body">
            Favourite Quotes
          </Text>
          {quotes.length > 0 && (
            <View className="rounded-full bg-[#ede9f7] px-2 py-0.5">
              <Text className="text-[11px] font-semibold text-[#7851A9]" variant="caption">
                {quotes.length}
              </Text>
            </View>
          )}
        </View>
        <Pressable
          className="flex-row items-center gap-1"
          onPress={() => setSheetVisible(true)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons color={BRAND} name="add-circle-outline" size={16} />
          <Text className="text-[13px] font-medium text-[#7851A9]" variant="body">Add</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={BRAND} />
      ) : quotes.length === 0 ? (
        <Pressable
          className="items-center gap-2 rounded-[12px] border border-dashed border-[#d9d9d9] py-6"
          onPress={() => setSheetVisible(true)}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Ionicons color="#c0c0c0" name="chatbox-outline" size={24} />
          <Text className="text-[13px] text-[#9b9b9b]" variant="body">
            Save memorable quotes from this book
          </Text>
        </Pressable>
      ) : (
        quotes.map((q) => (
          <QuoteCard key={q.id} onDelete={() => handleDelete(q)} quote={q} />
        ))
      )}

      <AddQuoteSheet
        onClose={() => setSheetVisible(false)}
        onSave={addQuote}
        visible={sheetVisible}
      />
    </View>
  );
});
QuotesSection.displayName = 'QuotesSection';
