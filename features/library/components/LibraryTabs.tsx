import { Tabs } from '@/components';

type LibraryTabsProps = {
  onChange: (value: 'book-clubs' | 'bookshelves') => void;
  value: 'book-clubs' | 'bookshelves';
};

export const LibraryTabs = ({ onChange, value }: LibraryTabsProps) => (
  <Tabs
    onValueChange={onChange}
    options={[
      { label: 'Bookshelves', value: 'bookshelves' },
      { label: 'Book Clubs', value: 'book-clubs' },
    ]}
    value={value}
  />
);
