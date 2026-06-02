import { useEffect, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

const ITEM_HEIGHT = 56;
const VISIBLE = 5;
const HALF = Math.floor(VISIBLE / 2);
export const GOAL_MAX = 200;

const ITEMS: (number | null)[] = [
  ...Array<null>(HALF).fill(null),
  ...Array.from({ length: GOAL_MAX }, (_, i) => i + 1),
  ...Array<null>(HALF).fill(null),
];

type Props = {
  initialValue: number;
  onChange: (value: number) => void;
};

export function GoalScrollPicker({ initialValue, onChange }: Props) {
  const ref = useRef<FlatList<number | null>>(null);
  const [selected, setSelected] = useState(initialValue);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollToOffset({
        animated: false,
        offset: (initialValue - 1) * ITEM_HEIGHT,
      });
    }, 80);
    return () => clearTimeout(t);
  }, [initialValue]);

  const handleScrollEnd = (e: {
    nativeEvent: { contentOffset: { y: number } };
  }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const v = Math.max(1, Math.min(GOAL_MAX, idx + 1));
    setSelected(v);
    onChange(v);
  };

  return (
    <View style={{ height: ITEM_HEIGHT * VISIBLE, overflow: 'hidden' }}>
      <View
        pointerEvents="none"
        style={{
          borderRadius: 14,
          backgroundColor: '#ede8fb',
          height: ITEM_HEIGHT,
          left: 0,
          position: 'absolute',
          right: 0,
          top: ITEM_HEIGHT * HALF,
        }}
      />
      <FlatList
        ref={ref}
        data={ITEMS}
        decelerationRate="fast"
        extraData={selected}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item, index }) => {
          if (item === null) return <View style={{ height: ITEM_HEIGHT }} />;
          const dist = Math.abs(index - HALF - (selected - 1));
          const isSelected = dist === 0;
          return (
            <View
              style={{
                alignItems: 'center',
                height: ITEM_HEIGHT,
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: isSelected ? '#7851A9' : dist === 1 ? '#888' : '#ccc',
                  fontSize: isSelected ? 34 : dist === 1 ? 24 : 18,
                  fontWeight: isSelected ? '700' : '400',
                }}
              >
                {item}
              </Text>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
      />
    </View>
  );
}
