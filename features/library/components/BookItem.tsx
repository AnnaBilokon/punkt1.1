import { BookCard } from '@/components';
import type { Book } from '@/types';

type BookItemProps = {
  book: Book;
  showCaption?: boolean;
  variant?: 'compact' | 'default';
};

export const BookItem = ({ book, showCaption, variant }: BookItemProps) => (
  <BookCard
    book={book}
    {...(showCaption === undefined ? null : { showCaption })}
    {...(variant === undefined ? null : { variant })}
  />
);
