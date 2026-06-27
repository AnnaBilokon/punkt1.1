import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/atoms/Text';

type Props = {
  maxTags?: number;
  onChange: (tags: string[]) => void;
  tags: string[];
};

export function TagInput({ tags, onChange, maxTags = 10 }: Props) {
  const [input, setInput] = useState('');

  const addTag = (raw: string) => {
    const value = raw.replace(/,/g, '').trim();
    if (!value || tags.includes(value) || tags.length >= maxTags) {
      setInput('');
      return;
    }
    onChange([...tags, value]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <View className="gap-2">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {tags.map((tag) => (
          <Pressable
            key={tag}
            accessibilityLabel={`Remove tag ${tag}`}
            onPress={() => removeTag(tag)}
            style={{
              alignItems: 'center',
              backgroundColor: '#e2f5ff',
              borderRadius: 20,
              flexDirection: 'row',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: '#28231c', fontSize: 12 }}>{tag}</Text>
            <Text style={{ color: '#655356', fontSize: 12 }}>×</Text>
          </Pressable>
        ))}
      </View>
      {tags.length < maxTags && (
        <TextInput
          className="rounded-[10px] border border-[#d9d9d9] bg-[#f5f2ee] px-3 text-[14px] text-black"
          onChangeText={(v) => {
            if (v.endsWith(',')) {
              addTag(v);
            } else {
              setInput(v);
            }
          }}
          onSubmitEditing={() => addTag(input)}
          placeholder="Add a tag and press Enter or comma…"
          placeholderTextColor="#aaa"
          returnKeyType="done"
          style={{ height: 44 }}
          value={input}
        />
      )}
      <Text style={{ color: '#aaa', fontSize: 11 }}>
        {tags.length} / {maxTags} tags
      </Text>
    </View>
  );
}
