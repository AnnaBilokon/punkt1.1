import type { Book, Bookshelf } from '@/types';

export const mockBooks: Book[] = [
  {
    author: 'Elizabeth Strout',
    coverImage:
      'https://www.figma.com/api/mcp/asset/1e6e3962-ea81-499a-bd58-3e3d358b04bc',
    description:
      'A literary novel about family, memory, and late-life revelations.',
    genres: ['Literary Fiction'],
    id: 'book-1',
    pages: 336,
    progress: 82,
    publishedYear: 2024,
    rating: 4.4,
    status: 'reading',
    title: 'Tell Me Everything',
  },
  {
    author: 'Lisa Barr',
    coverImage:
      'https://www.figma.com/api/mcp/asset/86ba0e79-d651-40ce-86d3-adedc79e5dcb',
    description:
      'A historical thriller set against the glamorous backdrop of postwar art and exile.',
    genres: ['Historical Fiction'],
    id: 'book-2',
    pages: 432,
    progress: 34,
    publishedYear: 2024,
    rating: 4.1,
    status: 'reading',
    title: 'The Goddess of Warsaw',
  },
  {
    author: 'Jodi Picoult & Jennifer Finney Boylan',
    coverImage:
      'https://www.figma.com/api/mcp/asset/28e46ff4-2445-4744-8691-7177223d8af4',
    description:
      'A layered courtroom drama about secrets, memory, and marriage.',
    genres: ['Contemporary Fiction'],
    id: 'book-3',
    pages: 464,
    progress: 12,
    publishedYear: 2022,
    rating: 4.0,
    status: 'reading',
    title: 'Mad Honey',
  },
  {
    author: 'Lucy Foley',
    coverImage:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    description: 'A suspenseful mystery reserved for your current shelf count.',
    genres: ['Mystery'],
    id: 'book-4',
    pages: 384,
    progress: 8,
    publishedYear: 2024,
    rating: 3.9,
    status: 'reading',
    title: 'The Midnight Feast',
  },
  {
    author: 'Matt Haig',
    coverImage:
      'https://www.figma.com/api/mcp/asset/76cac816-6c0c-462e-9507-767d9bcfb9c7',
    description:
      'A reflective story about regret, possibility, and alternate lives.',
    genres: ['Fantasy'],
    id: 'book-5',
    pages: 304,
    progress: 0,
    publishedYear: 2020,
    rating: 4.2,
    status: 'want-to-read',
    title: 'The Midnight Library',
  },
  {
    author: 'James Clear',
    coverImage:
      'https://www.figma.com/api/mcp/asset/f0ad7d2b-1575-4bb1-9414-7131414ef5d1',
    description:
      'A practical guide to behavior change through small consistent improvements.',
    genres: ['Self Help'],
    id: 'book-6',
    pages: 320,
    progress: 0,
    publishedYear: 2018,
    rating: 4.7,
    status: 'want-to-read',
    title: 'Atomic Habits',
  },
];

export const mockBookshelves: Bookshelf[] = [
  {
    bookIds: ['book-1', 'book-2', 'book-3', 'book-4'],
    id: 'shelf-1',
    isPrivate: false,
    name: 'My library',
  },
  {
    bookIds: ['book-5', 'book-6'],
    id: 'shelf-2',
    isPrivate: true,
    name: 'Want to read',
  },
];
