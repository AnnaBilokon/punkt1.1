import type { Book, Bookshelf } from '@/types';

export const mockBooks: Book[] = [
  {
    author: 'Sally Rooney',
    coverImage:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    description:
      'A quiet and sharp portrait of intimacy, class, and self-invention.',
    genres: ['Literary Fiction'],
    id: 'book-1',
    pages: 304,
    progress: 62,
    publishedYear: 2018,
    rating: 4.5,
    status: 'reading',
    title: 'Normal People',
  },
  {
    author: 'Robin Wall Kimmerer',
    coverImage:
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    description: 'Essays linking ecology, science, and Indigenous wisdom.',
    genres: ['Nonfiction'],
    id: 'book-2',
    pages: 408,
    progress: 100,
    publishedYear: 2013,
    rating: 4.8,
    status: 'completed',
    title: 'Braiding Sweetgrass',
  },
  {
    author: 'R. F. Kuang',
    coverImage:
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
    description: 'A satirical campus novel about authorship and ambition.',
    genres: ['Contemporary'],
    id: 'book-3',
    pages: 544,
    progress: 0,
    publishedYear: 2023,
    rating: 4.2,
    status: 'want-to-read',
    title: 'Yellowface',
  },
  {
    author: 'Madeline Miller',
    coverImage:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    description: 'A lyrical retelling of Achilles and Patroclus.',
    genres: ['Mythology'],
    id: 'book-4',
    pages: 416,
    progress: 18,
    publishedYear: 2011,
    rating: 4.7,
    status: 'reading',
    title: 'The Song of Achilles',
  },
  {
    author: 'Bonnie Garmus',
    coverImage:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    description: 'A smart and buoyant novel about chemistry and reinvention.',
    genres: ['Historical Fiction'],
    id: 'book-5',
    pages: 400,
    progress: 0,
    publishedYear: 2022,
    rating: 4.3,
    status: 'want-to-read',
    title: 'Lessons in Chemistry',
  },
];

export const mockBookshelves: Bookshelf[] = [
  {
    bookIds: ['book-1', 'book-2', 'book-4'],
    id: 'shelf-1',
    isPrivate: false,
    name: 'Currently reading',
  },
  {
    bookIds: ['book-3', 'book-5'],
    id: 'shelf-2',
    isPrivate: true,
    name: 'Want to read',
  },
];
