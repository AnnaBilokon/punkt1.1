import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { Card } from '@/components/organisms/Card';

const FAQ_ITEMS = [
  {
    answer:
      'Go to Library → tap any book cover → use the "My reading" tab to update the status, dates, and your rating.',
    id: '1',
    question: 'How do I log a book as finished?',
  },
  {
    answer:
      'Open the Reading Challenge card on the Home screen or Library. Tap "Edit goal" to change your yearly book target.',
    id: '2',
    question: 'How do I change my reading goal?',
  },
  {
    answer:
      'In the Discover tab, tap the search bar and type a title or author. You can also add a book manually with the "+" button.',
    id: '3',
    question: 'How do I add a book not in the database?',
  },
  {
    answer:
      'Achievements are awarded automatically based on your reading activity. Check the Achievements section on your Profile page.',
    id: '4',
    question: 'How do achievements work?',
  },
];

const FaqRow = memo(
  ({ answer, question }: { answer: string; question: string }) => {
    const [open, setOpen] = useState(false);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className="border-b border-[#f0f0f0] py-4"
        onPress={() => setOpen((v) => !v)}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Text
            className="flex-1 text-[14px] font-medium text-[#313C5D]"
            variant="body"
          >
            {question}
          </Text>
          <Ionicons
            color="#9b9b9b"
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
          />
        </View>
        {open && (
          <Text
            className="mt-2 text-[13px] leading-[20px] text-[#555]"
            variant="body"
          >
            {answer}
          </Text>
        )}
      </TouchableOpacity>
    );
  },
);
FaqRow.displayName = 'FaqRow';

export const HelpScreen = memo(() => {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');

  const sendFeedback = () => {
    if (!feedback.trim()) return;
    Alert.alert('Thanks!', 'Your feedback has been sent.');
    setFeedback('');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fdfdfd]" edges={['top']}>
      <View className="flex-row items-center border-b border-[#f0f0f0] px-4 pb-4 pt-2">
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full"
          onPress={() => router.back()}
        >
          <Ionicons color="#313C5D" name="chevron-back" size={22} />
        </Pressable>
        <Text
          className="mr-9 flex-1 text-center text-[17px] font-semibold text-black"
          variant="body"
        >
          Help & feedback
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2 px-4">
          <Text
            className="mb-1 text-[12px] font-medium uppercase tracking-widest text-[#9b9b9b]"
            variant="caption"
          >
            FAQ
          </Text>
          <Card className="rounded-[16px] border-[#e8e8e8] bg-white px-4 py-0">
            {FAQ_ITEMS.map((item) => (
              <FaqRow
                answer={item.answer}
                key={item.id}
                question={item.question}
              />
            ))}
          </Card>

          <Text
            className="mb-1 mt-6 text-[12px] font-medium uppercase tracking-widest text-[#9b9b9b]"
            variant="caption"
          >
            Send feedback
          </Text>
          <Card className="gap-3 rounded-[16px] border-[#e8e8e8] bg-white p-4">
            <TextInput
              className="text-[14px] text-black"
              multiline
              numberOfLines={4}
              onChangeText={setFeedback}
              placeholder="Tell us what you think or report a bug…"
              placeholderTextColor="#c0c0c0"
              style={{ minHeight: 96, textAlignVertical: 'top' }}
              value={feedback}
            />
            <TouchableOpacity
              activeOpacity={feedback.trim() ? 0.75 : 1}
              className="items-center rounded-full py-3"
              onPress={sendFeedback}
              style={{
                backgroundColor: feedback.trim() ? '#7851A9' : '#e8e8e8',
              }}
            >
              <Text
                className="text-[14px] font-semibold"
                style={{ color: feedback.trim() ? '#fff' : '#9b9b9b' }}
                variant="body"
              >
                Send
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

HelpScreen.displayName = 'HelpScreen';
