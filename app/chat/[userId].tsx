import { useLocalSearchParams } from 'expo-router';

import { ChatScreen } from '@/features/social/screens/ChatScreen';

export default function ChatRoute() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  return <ChatScreen otherUserId={userId} />;
}
