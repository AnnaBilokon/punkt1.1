import { memo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { useAuthStore } from '@/store/authStore';
import { useShelfStore } from '@/store/shelfStore';

type Props = {
  onClose: () => void;
  visible: boolean;
};

export const CreateShelfModal = memo(({ onClose, visible }: Props) => {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const createShelf = useShelfStore((s) => s.createShelf);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!userId || !name.trim()) return;
    setSaving(true);
    try {
      await createShelf(userId, name.trim());
      setName('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/40"
        onPress={handleClose}
      >
        <Pressable
          className="mx-6 w-full rounded-[18px] bg-white px-6 py-6"
          onPress={() => {}}
        >
          <Text className="mb-4 text-[18px] font-semibold text-black" variant="body">
            New shelf
          </Text>
          <TextInput
            autoFocus
            className="rounded-[10px] border border-[#d9d9d9] bg-[#f9f9f9] px-4 text-[15px] text-black"
            maxLength={50}
            onChangeText={setName}
            onSubmitEditing={() => void handleCreate()}
            placeholder="Shelf name"
            placeholderTextColor="#aaa"
            returnKeyType="done"
            style={{ height: 48 }}
            value={name}
          />
          <View className="mt-5 flex-row gap-3">
            <Pressable
              className="flex-1 items-center justify-center rounded-[10px] border border-[#d9d9d9] py-3"
              onPress={handleClose}
            >
              <Text className="text-[14px] font-medium text-[#6d7a88]" variant="body">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              className="flex-[2] items-center justify-center rounded-[10px] py-3"
              disabled={saving || !name.trim()}
              onPress={() => void handleCreate()}
              style={{
                backgroundColor: '#7D5BA6',
                opacity: saving || !name.trim() ? 0.5 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-[14px] font-semibold text-white" variant="body">
                  Create
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

CreateShelfModal.displayName = 'CreateShelfModal';
