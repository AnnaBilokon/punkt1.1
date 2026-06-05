import type { Book } from '@/types';

type GoogleIndustryIdentifier = {
  type: 'ISBN_10' | 'ISBN_13' | string;
  identifier: string;
};

type GoogleVolumeInfo = {
  authors?: string[];
  categories?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  industryIdentifiers?: GoogleIndustryIdentifier[];
  language?: string;
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
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

const extractIsbn = (
  identifiers?: GoogleIndustryIdentifier[],
): string | undefined => {
  if (!identifiers?.length) return undefined;
  const isbn13 = identifiers.find((i) => i.type === 'ISBN_13');
  const isbn10 = identifiers.find((i) => i.type === 'ISBN_10');
  return isbn13?.identifier ?? isbn10?.identifier;
};

export const mapGoogleVolume = (volume: GoogleVolume): Book => {
  const info = volume.volumeInfo;
  const isbn = extractIsbn(info.industryIdentifiers);
  const language = info.language;
  const publisher = info.publisher;
  return {
    author: info.authors?.join(', ') ?? 'Unknown Author',
    coverImage: normalizeCover(info.imageLinks),
    description: info.description ?? '',
    genres: normalizeGenres(info.categories),
    id: volume.id,
    ...(isbn !== undefined ? { isbn } : {}),
    ...(language !== undefined ? { language } : {}),
    pages: info.pageCount ?? 0,
    progress: 0,
    publishedYear: info.publishedDate
      ? parseInt(info.publishedDate.slice(0, 4), 10)
      : 0,
    ...(publisher !== undefined ? { publisher } : {}),
    rating: info.averageRating ?? 0,
    status: null,
    title: info.title ?? 'Untitled',
  };
};

export const mapGoogleBooksResponse = (data: GoogleBooksResponse): Book[] =>
  (data.items ?? []).map(mapGoogleVolume);
