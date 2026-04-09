import { BookCard } from '@/components';
import type { Book } from '@/types';

type BookItemProps = {
  book: Book;
};

export const BookItem = ({ book }: BookItemProps) => <BookCard book={book} />;
