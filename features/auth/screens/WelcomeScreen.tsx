import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/molecules/Button';
import { Container } from '@/components/organisms/Container';
import { Screen } from '@/components/organisms/Screen';

type FeatureCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const FeatureCard = ({ icon, label }: FeatureCardProps) => (
  <View className="flex-1 items-center justify-center gap-3 rounded-[7px] border border-border bg-white p-6 dark:border-borderDark dark:bg-surfaceDark">
    <Ionicons color="#7851A9" name={icon} size={30} />
    <Text variant="label" className="text-center text-text dark:text-textDark">
      {label}
    </Text>
  </View>
);

const FEATURES: FeatureCardProps[] = [
  { icon: 'people-outline', label: 'Create Book Clubs' },
  { icon: 'book-outline', label: 'Get a surprise book' },
  { icon: 'ribbon-outline', label: 'Collect stickers' },
  { icon: 'pencil-outline', label: 'Contribute while reading' },
];

export const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <Screen>
      <Container className="flex-1 justify-between py-16">
        <View className="items-center gap-4">
          <Text variant="display">Punkt</Text>
          <Text
            variant="body"
            className="text-muted dark:text-mutedDark text-center"
          >
            Connect with readers, track your reading journey and discover your
            next favourite book
          </Text>
        </View>

        <View className="gap-4">
          <View className="flex-row gap-4">
            <FeatureCard {...FEATURES[0]!} />
            <FeatureCard {...FEATURES[1]!} />
          </View>
          <View className="flex-row gap-4">
            <FeatureCard {...FEATURES[2]!} />
            <FeatureCard {...FEATURES[3]!} />
          </View>
        </View>

        <View className="gap-4">
          <Button
            label="Sign in"
            onPress={() => router.push('/(auth)/sign-in')}
            tone="primary"
          />
          <Button
            label="Sign up"
            onPress={() => router.push('/(auth)/sign-up')}
            tone="secondary"
          />
        </View>
      </Container>
    </Screen>
  );
};
