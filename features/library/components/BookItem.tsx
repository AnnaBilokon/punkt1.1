import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { BookCard } from '@/components';
import type { Book } from '@/types';

type BookItemProps = {
  book: Book;
  showCaption?: boolean;
  variant?: 'compact' | 'default';
};

export const BookItem = ({ book, showCaption, variant }: BookItemProps) => {
  const router = useRouter();
  const handlePress = useCallback(
    (b: Book) => router.push(`/book/${b.id}`),
    [router],
  );

  return (
    <BookCard
      book={book}
      onPress={handlePress}
      {...(showCaption === undefined ? null : { showCaption })}
      {...(variant === undefined ? null : { variant })}
    />
  );
};
