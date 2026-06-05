import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { useBookShelfIds } from '@/features/library/hooks/useBookShelfIds';
import { useCustomShelves } from '@/features/library/hooks/useCustomShelves';
import { useUserBooks } from '@/features/library/hooks/useUserBooks';
import { useAuthStore } from '@/store/authStore';
import { useBookStore } from '@/store/bookStore';
import { useShelfStore } from '@/store/shelfStore';
import type { Book, BookStatus } from '@/types';

type Props = {
  book?: Book;
  bookApiId: string | null;
  onClose: () => void;
  onSaved?: () => void;
  visible: boolean;
};

const DEFAULT_SHELVES: { label: string; status: BookStatus }[] = [
  { label: 'TBR', status: 'want-to-read' },
  { label: 'Currently Reading', status: 'reading' },
  { label: 'Finished', status: 'completed' },
  { label: 'Did Not Finish', status: 'dnf' },
];

export const AddToShelfModal = memo(({ book, bookApiId, onClose, onSaved, visible }: Props) => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const { data: shelves = [] } = useCustomShelves(userId);
  const { data: currentShelfIds = [] } = useBookShelfIds(bookApiId, userId);
  const { data: userBooks = [] } = useUserBooks(userId);
  const addBook = useBookStore((s) => s.addBook);
  const addBookToShelf = useShelfStore((s) => s.addBookToShelf);
  const removeBookFromShelf = useShelfStore((s) => s.removeBookFromShelf);
  const updateBookStatus = useBookStore((s) => s.updateBookStatus);

  const savedBook = userBooks.find((b) => b.id === bookApiId);
  const originalStatus = savedBook?.status ?? null;

  const [selectedStatus, setSelectedStatus] = useState<BookStatus | null>(originalStatus);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Only initialize state when the modal transitions from closed → open,
  // not on background refetches that update currentShelfIds/originalStatus
  // while the user is actively making selections.
  const wasVisibleRef = useRef(false);
  useEffect(() => {
    const justOpened = visible && !wasVisibleRef.current;
    wasVisibleRef.current = visible;
    if (justOpened) {
      setSelectedStatus(originalStatus);
      setSelected(new Set(currentShelfIds));
    }
  }, [visible, currentShelfIds, originalStatus]);

  const toggleStatus = (status: BookStatus) => {
    setSelectedStatus((prev) => (prev === status ? null : status));
  };

  const toggle = (shelfId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(shelfId)) next.delete(shelfId);
      else next.add(shelfId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!userId || !bookApiId) return;
    setSaving(true);
    try {
      const isNewBook = !savedBook;
      const ops: Promise<void>[] = [];

      if (isNewBook && book) {
        ops.push(addBook(userId, book, selectedStatus));
      } else if (!isNewBook && selectedStatus !== originalStatus) {
        ops.push(updateBookStatus(userId, bookApiId, selectedStatus));
      }

      const toAdd = shelves.filter(
        (s) => selected.has(s.id) && !currentShelfIds.includes(s.id),
      );
      const toRemove = shelves.filter(
        (s) => !selected.has(s.id) && currentShelfIds.includes(s.id),
      );
      ops.push(...toAdd.map((s) => addBookToShelf(s.id, bookApiId, userId)));
      ops.push(...toRemove.map((s) => removeBookFromShelf(s.id, bookApiId, userId)));

      await Promise.all(ops);
      onSaved?.();
      onClose();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-[24px] bg-white px-6 pb-10 pt-5"
          onPress={() => {}}
        >
          <View className="mb-1 h-1 w-10 self-center rounded-full bg-[#e0e0e0]" />
          <Text className="mb-4 mt-3 text-[18px] font-semibold text-black" variant="body">
            Bookshelves
          </Text>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 360 }}
          >
            {/* Default shelves */}
            <Text className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#9b9b9b]" variant="body">
              Default
            </Text>
            {DEFAULT_SHELVES.map(({ label, status }) => {
              const isChecked = selectedStatus === status;
              return (
                <Pressable
                  key={status}
                  className="flex-row items-center gap-3 py-3"
                  onPress={() => toggleStatus(status)}
                >
                  <View
                    className="h-6 w-6 items-center justify-center rounded-[6px]"
                    style={{
                      backgroundColor: isChecked ? '#7851A9' : '#f0f0f0',
                      borderColor: isChecked ? '#7851A9' : '#d0d0d0',
                      borderWidth: 1.5,
                    }}
                  >
                    {isChecked && (
                      <Ionicons color="#fff" name="checkmark" size={14} />
                    )}
                  </View>
                  <Text className="flex-1 text-[15px] text-black" variant="body">
                    {label}
                  </Text>
                </Pressable>
              );
            })}

            {/* Divider */}
            <View className="my-3 h-px bg-[#f0f0f0]" />

            {/* Custom shelves */}
            <Text className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#9b9b9b]" variant="body">
              Custom
            </Text>
            {shelves.length === 0 ? (
              <View className="py-3">
                <Text className="text-[14px] text-[#9b9b9b]" variant="body">
                  No custom shelves yet. Create one from your Library.
                </Text>
              </View>
            ) : (
              shelves.map((shelf) => {
                const isChecked = selected.has(shelf.id);
                return (
                  <Pressable
                    key={shelf.id}
                    className="flex-row items-center gap-3 py-3"
                    onPress={() => toggle(shelf.id)}
                  >
                    <View
                      className="h-6 w-6 items-center justify-center rounded-[6px]"
                      style={{
                        backgroundColor: isChecked ? '#7851A9' : '#f0f0f0',
                        borderColor: isChecked ? '#7851A9' : '#d0d0d0',
                        borderWidth: 1.5,
                      }}
                    >
                      {isChecked && (
                        <Ionicons color="#fff" name="checkmark" size={14} />
                      )}
                    </View>
                    <Text className="flex-1 text-[15px] text-black" variant="body">
                      {shelf.name}
                    </Text>
                    <Text className="text-[13px] text-[#9b9b9b]" variant="body">
                      {shelf.bookCount} book{shelf.bookCount !== 1 ? 's' : ''}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <Pressable
            className="mt-4 items-center justify-center rounded-[12px] py-3.5"
            disabled={saving}
            onPress={() => void handleSave()}
            style={{ backgroundColor: '#7851A9', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[15px] font-semibold text-white" variant="body">
                Save
              </Text>
            )}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

AddToShelfModal.displayName = 'AddToShelfModal';
