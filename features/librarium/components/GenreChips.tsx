import { Pressable, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { LIBRARIUM_GENRES } from '../constants';

type Props = {
  onChange: (genres: string[]) => void;
  selected: string[];
};

export function GenreChips({ selected, onChange }: Props) {
  const toggle = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {LIBRARIUM_GENRES.map((genre) => {
        const active = selected.includes(genre);
        return (
          <Pressable
            key={genre}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            onPress={() => toggle(genre)}
            style={{
              backgroundColor: active ? '#c1eeff' : '#e2f5ff',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                color: active ? '#070707' : '#655356',
                fontSize: 13,
                fontWeight: active ? '600' : '400',
              }}
            >
              {genre}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
