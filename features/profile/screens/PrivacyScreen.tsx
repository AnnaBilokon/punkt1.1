import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/atoms/Text';
import { Card } from '@/components/organisms/Card';

type ToggleRowProps = {
  description: string;
  label: string;
  onChange: (v: boolean) => void;
  value: boolean;
};

const ToggleRow = memo(
  ({ description, label, onChange, value }: ToggleRowProps) => (
    <View className="flex-row items-center justify-between border-b border-[#f0f0f0] py-3">
      <View className="flex-1 pr-4">
        <Text className="text-[15px] text-black" variant="body">
          {label}
        </Text>
        <Text className="mt-0.5 text-[12px] text-[#9b9b9b]" variant="caption">
          {description}
        </Text>
      </View>
      <Switch
        onValueChange={onChange}
        thumbColor="#fff"
        trackColor={{ false: '#d9d9d9', true: '#7851A9' }}
        value={value}
      />
    </View>
  ),
);
ToggleRow.displayName = 'ToggleRow';

export const PrivacyScreen = memo(() => {
  const router = useRouter();
  const [publicProfile, setPublicProfile] = useState(false);
  const [shareStats, setShareStats] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

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
          Privacy
        </Text>
      </View>

      <View className="mt-6 gap-2 px-4">
        <Text
          className="mb-1 text-[12px] font-medium uppercase tracking-widest text-[#9b9b9b]"
          variant="caption"
        >
          Profile visibility
        </Text>
        <Card className="rounded-[16px] border-[#e8e8e8] bg-white px-4 py-0">
          <ToggleRow
            description="Allow others to see your profile and shelves"
            label="Public profile"
            onChange={setPublicProfile}
            value={publicProfile}
          />
          <ToggleRow
            description="Share your reading stats with the community"
            label="Share reading stats"
            onChange={setShareStats}
            value={shareStats}
          />
        </Card>

        <Text
          className="mb-1 mt-4 text-[12px] font-medium uppercase tracking-widest text-[#9b9b9b]"
          variant="caption"
        >
          Data
        </Text>
        <Card className="rounded-[16px] border-[#e8e8e8] bg-white px-4 py-0">
          <ToggleRow
            description="Help improve the app with anonymous usage data"
            label="Analytics"
            onChange={setAnalyticsConsent}
            value={analyticsConsent}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
});

PrivacyScreen.displayName = 'PrivacyScreen';
