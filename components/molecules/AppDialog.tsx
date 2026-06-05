import { Modal, Pressable, View } from 'react-native';

import { Text } from '@/components/atoms/Text';

export type DialogButton = {
  label: string;
  onPress: () => void;
  type?: 'cancel' | 'default' | 'destructive';
};

type AppDialogProps = {
  buttons: DialogButton[];
  message?: string | undefined;
  onClose: () => void;
  title: string;
  visible: boolean;
};

export function AppDialog({
  visible,
  onClose,
  title,
  message,
  buttons,
}: AppDialogProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-8"
        onPress={onClose}
      >
        <Pressable
          className="w-full overflow-hidden rounded-[18px] bg-white"
          onPress={() => {}}
        >
          {/* Title + message */}
          <View className="items-center px-5 pb-3 pt-5">
            <Text className="text-center text-[16px] font-bold text-[#15151e]">
              {title}
            </Text>
            {message ? (
              <Text className="mt-1.5 text-center text-[13px] text-[#6d7a88]">
                {message}
              </Text>
            ) : null}
          </View>

          {/* Divider */}
          <View className="h-px bg-[#e8e8e8]" />

          {/* Buttons */}
          {buttons.map((btn, index) => (
            <View key={btn.label}>
              <Pressable
                className="items-center px-5 py-3.5"
                onPress={() => {
                  onClose();
                  btn.onPress();
                }}
              >
                <Text
                  className={`text-[15px] ${
                    btn.type === 'destructive'
                      ? 'font-semibold text-[#e53935]'
                      : btn.type === 'cancel'
                        ? 'font-normal text-[#6d7a88]'
                        : 'font-semibold text-[#7851A9]'
                  }`}
                >
                  {btn.label}
                </Text>
              </Pressable>
              {index < buttons.length - 1 && (
                <View className="h-px bg-[#e8e8e8]" />
              )}
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
