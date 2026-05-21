import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AddToShelfModal } from '@/features/library/components/AddToShelfModal';
import { useLibrarySections } from '@/features/library/hooks/useLibrarySections';
import { ShelfScreen } from '@/features/library/screens/ShelfScreen';

export default function ShelfRoute() {
  const { status } = useLocalSearchParams<{ status: string }>();
  const { keepReading, wantToRead, finished } = useLibrarySections();
  const [addToShelfBookId, setAddToShelfBookId] = useState<string | null>(null);

  const books =
    status === 'reading'
      ? keepReading
      : status === 'want-to-read'
        ? wantToRead
        : finished;

  return (
    <>
      <ShelfScreen
        books={books}
        status={status ?? 'reading'}
        onLongPressBook={(bookId) => setAddToShelfBookId(bookId)}
      />
      <AddToShelfModal
        bookApiId={addToShelfBookId}
        visible={addToShelfBookId !== null}
        onClose={() => setAddToShelfBookId(null)}
      />
    </>
  );
}
