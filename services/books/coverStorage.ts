import { env } from '@/constants/env';
import { supabase } from '@/services/supabase';

const BUCKET = 'book-covers';

const safeExt = (raw: string) =>
  ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(raw) ? raw : 'jpg';

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const uploadToStorage = async (
  body: ArrayBuffer,
  userId: string,
  bookApiId: string,
  ext: string,
  contentType: string,
): Promise<string> => {
  const safeName = bookApiId.replace(/[^a-z0-9]/gi, '-').slice(0, 80);
  const path = `${userId}/${safeName}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Downloads the image at `url` and re-uploads it to Supabase Storage.
 * If the URL already points at our Supabase project it is returned unchanged.
 */
export const mirrorCoverToStorage = async (
  url: string,
  userId: string,
  bookApiId: string,
): Promise<string> => {
  if (url.startsWith(env.supabaseUrl)) return url;

  const response = await fetch(url, {
    headers: { Accept: 'image/*', 'User-Agent': 'Mozilla/5.0' },
  });
  if (!response.ok) throw new Error(`Could not fetch image (${response.status})`);
  const arrayBuffer = await response.arrayBuffer();

  const rawExt = ((url.split('?')[0] ?? url).split('.').pop() ?? 'jpg').toLowerCase();
  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  return uploadToStorage(arrayBuffer, userId, bookApiId, safeExt(rawExt), contentType);
};

/**
 * Uploads an image from a base64 string (expo-image-picker with base64: true).
 */
export const uploadCoverFromBase64 = async (
  base64: string,
  mimeType: string,
  userId: string,
  bookApiId: string,
): Promise<string> => {
  const arrayBuffer = base64ToArrayBuffer(base64);
  const ext = safeExt(mimeType.split('/')[1] ?? 'jpeg');
  return uploadToStorage(arrayBuffer, userId, bookApiId, ext, mimeType);
};
