import { useLocalSearchParams } from 'expo-router';

import { LibrariumSubmitScreen } from '@/features/librarium/screens/LibrariumSubmitScreen';

export default function LibrariumSubmitRoute() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  return <LibrariumSubmitScreen prefillTitle={title} />;
}
