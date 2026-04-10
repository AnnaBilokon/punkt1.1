import type { Book } from '@/types';

type GoogleVolumeInfo = {
  authors?: string[];
  categories?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  pageCount?: number;
  publishedDate?: string;
  averageRating?: number;
  title?: string;
};

export type GoogleVolume = {
  id: string;
  volumeInfo: GoogleVolumeInfo;
};

export type GoogleBooksResponse = {
  items?: GoogleVolume[];
  totalItems?: number;
};

const normalizeCover = (imageLinks?: GoogleVolumeInfo['imageLinks']) => {
  const url = imageLinks?.thumbnail ?? imageLinks?.smallThumbnail ?? '';
  // Google Books thumbnails come as http — force https
  return url.replace(/^http:\/\//, 'https://');
};

const normalizeGenres = (categories?: string[]): string[] => {
  if (!categories?.length) return ['General'];
  // Google categories can be "Fiction / Science Fiction" — split and deduplicate
  return Array.from(
    new Set(categories.flatMap((c) => c.split(' / ').map((s) => s.trim()))),
  ).slice(0, 3);
};

export const mapGoogleVolume = (volume: GoogleVolume): Book => ({
  author: volume.volumeInfo.authors?.join(', ') ?? 'Unknown Author',
  coverImage: normalizeCover(volume.volumeInfo.imageLinks),
  description: volume.volumeInfo.description ?? '',
  genres: normalizeGenres(volume.volumeInfo.categories),
  id: volume.id,
  pages: volume.volumeInfo.pageCount ?? 0,
  progress: 0,
  publishedYear: volume.volumeInfo.publishedDate
    ? parseInt(volume.volumeInfo.publishedDate.slice(0, 4), 10)
    : 0,
  rating: volume.volumeInfo.averageRating ?? 0,
  status: 'want-to-read',
  title: volume.volumeInfo.title ?? 'Untitled',
});

export const mapGoogleBooksResponse = (data: GoogleBooksResponse): Book[] =>
  (data.items ?? []).map(mapGoogleVolume);
