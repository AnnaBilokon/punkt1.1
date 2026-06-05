import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import type { WidgetId, WidgetItem } from '@/types';
import { WIDGET_LABELS } from '@/types';

const BRAND = '#7851A9';
const ITEM_HEIGHT = 62;

// ─── Sortable row ──────────────────────────────────────────────────────────────

const SortableRow = memo(
  ({
    activeIdx,
    count,
    dragY,
    hoverIdx,
    index,
    item,
    onCommitReorder,
    onToggle,
  }: {
    activeIdx: SharedValue<number>;
    count: number;
    dragY: SharedValue<number>;
    hoverIdx: SharedValue<number>;
    index: number;
    item: WidgetItem;
    onCommitReorder: (from: number, to: number) => void;
    onToggle: (id: WidgetId, enabled: boolean) => void;
  }) => {
    const gesture = Gesture.Pan()
      .activateAfterLongPress(200)
      .onStart(() => {
        activeIdx.value = index;
        hoverIdx.value = index;
        dragY.value = 0;
      })
      .onUpdate((e) => {
        dragY.value = e.translationY;
        hoverIdx.value = Math.min(
          Math.max(0, Math.round(index + e.translationY / ITEM_HEIGHT)),
          count - 1,
        );
      })
      .onEnd(() => {
        const from = activeIdx.value;
        const to = hoverIdx.value;
        activeIdx.value = -1;
        hoverIdx.value = -1;
        dragY.value = withSpring(0, { damping: 20, stiffness: 300 });
        if (from !== -1 && from !== to) {
          runOnJS(onCommitReorder)(from, to);
        }
      });

    const animStyle = useAnimatedStyle(() => {
      const a = activeIdx.value;
      const h = hoverIdx.value;
      const isActive = a === index;

      if (isActive) {
        return {
          backgroundColor: '#fff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          transform: [{ translateY: dragY.value }, { scale: 1.02 }],
          zIndex: 100,
        };
      }

      let shift = 0;
      if (a !== -1) {
        if (a < h && index > a && index <= h) shift = -ITEM_HEIGHT;
        else if (a > h && index >= h && index < a) shift = ITEM_HEIGHT;
      }

      return {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        transform: [
          { translateY: withSpring(shift, { damping: 20, stiffness: 300 }) },
          { scale: 1 },
        ],
        zIndex: 0,
      };
    });

    return (
      <Animated.View
        style={[
          {
            alignItems: 'center',
            borderBottomColor: '#f0f0f0',
            borderBottomWidth: 1,
            flexDirection: 'row',
            gap: 12,
            height: ITEM_HEIGHT,
            paddingHorizontal: 20,
          },
          animStyle,
        ]}
      >
        <GestureDetector gesture={gesture}>
          <View style={{ padding: 6 }}>
            <Ionicons color="#c0c0c0" name="menu" size={22} />
          </View>
        </GestureDetector>

        <Text
          style={{ flex: 1 }}
          className="text-[15px] text-black"
          variant="body"
        >
          {WIDGET_LABELS[item.id]}
        </Text>

        <Switch
          style={{ alignSelf: 'center' }}
          thumbColor="white"
          trackColor={{ false: '#e0e0e0', true: BRAND }}
          value={item.enabled}
          onValueChange={(v) => onToggle(item.id, v)}
        />
      </Animated.View>
    );
  },
);
SortableRow.displayName = 'SortableRow';

// ─── Screen ────────────────────────────────────────────────────────────────────

export const CustomiseHomeScreen = memo(() => {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.id);
  const storeWidgets = useProfileStore((s) => s.homeWidgets);
  const setHomeWidgets = useProfileStore((s) => s.setHomeWidgets);
  const updateHomeWidgets = useProfileStore((s) => s.updateHomeWidgets);

  const [items, setItems] = useState<WidgetItem[]>(storeWidgets);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeIdx = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const hoverIdx = useSharedValue(-1);

  const persist = useCallback(
    (next: WidgetItem[]) => {
      setHomeWidgets(next);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (userId) void updateHomeWidgets(userId, next);
      }, 500);
    },
    [userId, setHomeWidgets, updateHomeWidgets],
  );

  const commitReorder = useCallback(
    (from: number, to: number) => {
      const next = [...itemsRef.current];
      const [moved] = next.splice(from, 1);
      if (moved) next.splice(to, 0, moved);
      setItems(next);
      persist(next);
    },
    [persist],
  );

  const handleToggle = useCallback(
    (id: WidgetId, enabled: boolean) => {
      const next = itemsRef.current.map((w) =>
        w.id === id ? { ...w, enabled } : w,
      );
      setItems(next);
      persist(next);
    },
    [persist],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
        <View className="px-5 pb-3 pt-3">
          <Pressable
            className="mb-3 flex-row items-center gap-1 self-start"
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Ionicons color="#6d6d6d" name="chevron-back" size={20} />
            <Text className="text-[14px] text-[#6d6d6d]" variant="body">
              Settings
            </Text>
          </Pressable>
          <Text className="text-[24px] font-bold text-black" variant="body">
            Customise Home
          </Text>
          <Text className="mt-1 text-[13px] text-[#9b9b9b]" variant="body">
            Hold ≡ and drag to reorder. Toggle to show or hide.
          </Text>
        </View>

        <View
          className="mx-5 rounded-[16px] border border-[#e8e8e8]"
          style={{ overflow: 'visible' }}
        >
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              activeIdx={activeIdx}
              count={items.length}
              dragY={dragY}
              hoverIdx={hoverIdx}
              index={index}
              item={item}
              onCommitReorder={commitReorder}
              onToggle={handleToggle}
            />
          ))}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
});

CustomiseHomeScreen.displayName = 'CustomiseHomeScreen';
