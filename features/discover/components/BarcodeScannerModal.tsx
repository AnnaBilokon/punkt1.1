import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';

const BRAND = '#7851A9';
const WINDOW_W = 270;
const WINDOW_H = 160;
const CORNER = 20;
const BORDER = 3;

function CornerBrackets() {
  const corner = (pos: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  }) => {
    const isTop = pos.top !== undefined;
    const isLeft = pos.left !== undefined;
    return (
      <View
        style={{
          position: 'absolute',
          width: CORNER,
          height: CORNER,
          borderColor: 'white',
          borderTopWidth: isTop ? BORDER : 0,
          borderBottomWidth: !isTop ? BORDER : 0,
          borderLeftWidth: isLeft ? BORDER : 0,
          borderRightWidth: !isLeft ? BORDER : 0,
          ...pos,
        }}
      />
    );
  };
  return (
    <>
      {corner({ top: 0, left: 0 })}
      {corner({ top: 0, right: 0 })}
      {corner({ bottom: 0, left: 0 })}
      {corner({ bottom: 0, right: 0 })}
    </>
  );
}

type Props = {
  onClose: () => void;
  onScan: (isbn: string) => void;
  visible: boolean;
};

export function BarcodeScannerModal({ onClose, onScan, visible }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const lastScan = useRef<string | null>(null);

  useEffect(() => {
    if (visible) lastScan.current = null;
  }, [visible]);

  if (!visible) return null;

  if (!permission?.granted) {
    return (
      <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
        <View className="flex-1 items-center justify-center gap-5 bg-black px-8">
          <Ionicons color="white" name="barcode-outline" size={64} />
          <Text className="text-center text-[17px] font-semibold text-white">
            Camera access needed
          </Text>
          <Text className="text-center text-[13px] text-[#aaa]">
            To scan book barcodes, allow camera access.
          </Text>
          <Pressable
            className="items-center justify-center rounded-[10px] px-8 py-3"
            onPress={() => void requestPermission()}
            style={{ backgroundColor: BRAND }}
          >
            <Text className="text-[14px] font-semibold text-white">
              Allow Camera
            </Text>
          </Pressable>
          <Pressable hitSlop={12} onPress={onClose}>
            <Text className="text-[13px] text-[#aaa]">Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible={visible}>
      <View className="flex-1 bg-black">
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (lastScan.current === data) return;
            const clean = data.replace(/[-\s]/g, '');
            if (/^\d{13}$/.test(clean) || /^\d{9}[\dXx]$/.test(clean)) {
              lastScan.current = data;
              void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              onScan(clean);
              onClose();
            }
          }}
          style={{ flex: 1 }}
        />

        {/* Viewfinder overlay */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' }}
        >
          {/* Top dark region */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '50%', marginBottom: WINDOW_H / 2, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          {/* Bottom dark region */}
          <View style={{ position: 'absolute', top: '50%', marginTop: WINDOW_H / 2, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          {/* Left dark region */}
          <View style={{ position: 'absolute', top: '50%', bottom: '50%', marginTop: -(WINDOW_H / 2), marginBottom: -(WINDOW_H / 2), left: 0, width: `50%`, marginRight: WINDOW_W / 2, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          {/* Right dark region */}
          <View style={{ position: 'absolute', top: '50%', bottom: '50%', marginTop: -(WINDOW_H / 2), marginBottom: -(WINDOW_H / 2), right: 0, width: `50%`, marginLeft: WINDOW_W / 2, backgroundColor: 'rgba(0,0,0,0.6)' }} />

          {/* Scan window with corner brackets */}
          <View style={{ width: WINDOW_W, height: WINDOW_H }}>
            <CornerBrackets />
          </View>
        </View>

        <SafeAreaView
          edges={['top', 'bottom']}
          style={{ position: 'absolute', inset: 0 }}
          pointerEvents="box-none"
        >
          {/* Close */}
          <View className="flex-row items-center justify-between px-5 pt-2">
            <Pressable hitSlop={12} onPress={onClose}>
              <Ionicons color="white" name="close" size={30} />
            </Pressable>
          </View>

          {/* Label */}
          <View className="flex-1 items-center justify-end pb-16">
            <View className="rounded-full bg-black/50 px-5 py-2">
              <Text className="text-[13px] text-white">
                Point at the barcode on the back of the book
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
