export const env = {
  amazonBooksBaseUrl: process.env.EXPO_PUBLIC_AMAZON_BOOKS_BASE_URL ?? '',
  googleBooksApiKey: process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY ?? '',
  googleBooksBaseUrl:
    process.env.EXPO_PUBLIC_GOOGLE_BOOKS_BASE_URL ??
    'https://www.googleapis.com/books/v1',
  isbndbApiKey: process.env.EXPO_PUBLIC_ISBN_API_KEY ?? '',
  isbndbBaseUrl:
    process.env.EXPO_PUBLIC_ISBNDB_BASE_URL ?? 'https://api2.isbndb.com',
  nytBooksApiKey: process.env.EXPO_PUBLIC_NYT_BOOKS_API_KEY ?? '',
  nytBooksBaseUrl:
    process.env.EXPO_PUBLIC_NYT_BOOKS_BASE_URL ??
    'https://api.nytimes.com/svc/books/v3',
  openLibraryBaseUrl:
    process.env.EXPO_PUBLIC_OPEN_LIBRARY_BASE_URL ?? 'https://openlibrary.org',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
} as const;
