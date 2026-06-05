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
import { useJournal, useJournalActions } from '@/features/library/hooks/useJournal';
import type { JournalEntry } from '@/types';

const BRAND = '#7851A9';

const PROMPTS = [
  'What changed your thinking?',
  'Would you recommend it?',
  'What stuck with you?',
  'How did it make you feel?',
];

const isoToDisplay = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const EntryCard = memo(
  ({
    entry,
    onDelete,
    onEdit,
  }: {
    entry: JournalEntry;
    onDelete: () => void;
    onEdit: () => void;
  }) => (
    <View className="rounded-[12px] border border-[#e8e8e8] bg-white px-4 py-3 gap-2">
      {entry.prompt && (
        <Text className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wide" variant="caption">
          {entry.prompt}
        </Text>
      )}
      <Text className="text-[13px] leading-[19px] text-[#333]" numberOfLines={5} variant="body">
        {entry.body}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] text-[#c0c0c0]" variant="caption">
          {isoToDisplay(entry.createdAt)}
        </Text>
        <View className="flex-row gap-3">
          <Pressable hitSlop={10} onPress={onEdit} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <Ionicons color="#9b9b9b" name="pencil-outline" size={14} />
          </Pressable>
          <Pressable hitSlop={10} onPress={onDelete} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <Ionicons color="#c0c0c0" name="trash-outline" size={14} />
          </Pressable>
        </View>
      </View>
    </View>
  ),
);
EntryCard.displayName = 'EntryCard';

type WriteSheetProps = {
  editEntry?: JournalEntry;
  onClose: () => void;
  onSave: (body: string, prompt?: string) => Promise<void>;
  onUpdate?: (id: string, body: string) => Promise<void>;
  visible: boolean;
};

const WriteSheet = memo(({ editEntry, onClose, onSave, onUpdate, visible }: WriteSheetProps) => {
  const [body, setBody] = useState(editEntry?.body ?? '');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(editEntry?.prompt ?? null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setBody('');
    setSelectedPrompt(null);
  };

  const handleClose = () => {
    if (!editEntry) reset();
    onClose();
  };

  const handleSave = async () => {
    if (!body.trim()) return;
    setSaving(true);
    try {
      if (editEntry && onUpdate) {
        await onUpdate(editEntry.id, body.trim());
      } else {
        await onSave(body.trim(), selectedPrompt ?? undefined);
      }
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
        <View className="rounded-t-[28px] bg-white px-6 pb-10 pt-3" style={{ gap: 14 }}>
          <View className="h-1 w-10 self-center rounded-full bg-[#d9d9d9]" />
          <Text className="text-[18px] font-semibold text-black" variant="body">
            {editEntry ? 'Edit reflection' : 'Write a reflection'}
          </Text>

          {!editEntry && (
            <View className="flex-row flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <Pressable
                  key={p}
                  className="rounded-full px-3 py-1.5"
                  onPress={() => {
                    setSelectedPrompt((prev) => (prev === p ? null : p));
                    if (selectedPrompt !== p) setBody(body ? body : '');
                  }}
                  style={{ backgroundColor: selectedPrompt === p ? BRAND : '#f1edf8' }}
                >
                  <Text
                    className="text-[12px] font-medium"
                    style={{ color: selectedPrompt === p ? '#fff' : BRAND }}
                    variant="body"
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {selectedPrompt && !editEntry && (
            <Text className="text-[12px] font-semibold text-[#9b9b9b]" variant="caption">
              {selectedPrompt}
            </Text>
          )}

          <TextInput
            autoFocus
            className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-3 pt-2.5 text-[14px] text-black"
            maxLength={2000}
            multiline
            numberOfLines={5}
            onChangeText={setBody}
            placeholder={selectedPrompt ?? 'Write your thoughts…'}
            placeholderTextColor="#aaa"
            style={{ height: 120, textAlignVertical: 'top' }}
            value={body}
          />

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 items-center justify-center rounded-[10px] border border-[#d9d9d9] py-3"
              onPress={handleClose}
            >
              <Text className="text-[14px] font-medium text-[#6d7a88]" variant="body">Cancel</Text>
            </Pressable>
            <Pressable
              className="flex-[2] items-center justify-center rounded-[10px] py-3"
              disabled={saving || !body.trim()}
              onPress={() => void handleSave()}
              style={{ backgroundColor: BRAND, opacity: saving || !body.trim() ? 0.5 : 1 }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-[14px] font-semibold text-white" variant="body">Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});
WriteSheet.displayName = 'WriteSheet';

type Props = {
  bookApiId: string;
  userId: string;
};

export const JournalSection = memo(({ bookApiId, userId }: Props) => {
  const { data: entries = [], isLoading } = useJournal(bookApiId, userId);
  const { addEntry, deleteEntry, updateEntry } = useJournalActions(bookApiId, userId);
  const [writeVisible, setWriteVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const handleDelete = (entry: JournalEntry) => {
    Alert.alert(
      'Delete reflection?',
      'This journal entry will be permanently removed.',
      [
        { style: 'destructive', text: 'Delete', onPress: () => void deleteEntry(entry.id) },
        { style: 'cancel', text: 'Cancel' },
      ],
    );
  };

  return (
    <View className="gap-3 px-5 pb-2 pt-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-[15px] font-semibold text-black" variant="body">
            My Journal
          </Text>
          {entries.length > 0 && (
            <View className="rounded-full bg-[#ede9f7] px-2 py-0.5">
              <Text className="text-[11px] font-semibold text-[#7851A9]" variant="caption">
                {entries.length}
              </Text>
            </View>
          )}
        </View>
        <Pressable
          className="flex-row items-center gap-1"
          onPress={() => setWriteVisible(true)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons color={BRAND} name="add-circle-outline" size={16} />
          <Text className="text-[13px] font-medium text-[#7851A9]" variant="body">Write</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={BRAND} />
      ) : entries.length === 0 ? (
        <Pressable
          className="items-center gap-2 rounded-[12px] border border-dashed border-[#d9d9d9] py-6"
          onPress={() => setWriteVisible(true)}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Ionicons color="#c0c0c0" name="journal-outline" size={24} />
          <Text className="text-[13px] text-[#9b9b9b]" variant="body">
            Reflect on your reading experience
          </Text>
        </Pressable>
      ) : (
        entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onDelete={() => handleDelete(entry)}
            onEdit={() => setEditingEntry(entry)}
          />
        ))
      )}

      <WriteSheet
        onClose={() => setWriteVisible(false)}
        onSave={addEntry}
        visible={writeVisible}
      />

      {editingEntry && (
        <WriteSheet
          editEntry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={addEntry}
          onUpdate={updateEntry}
          visible={!!editingEntry}
        />
      )}
    </View>
  );
});
JournalSection.displayName = 'JournalSection';
