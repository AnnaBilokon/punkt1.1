import { env } from '@/constants/env';

export const hasAmazonBooksIntegration = () => Boolean(env.amazonBooksBaseUrl);

export const getAmazonBooksStatus = () => {
  if (!env.amazonBooksBaseUrl) {
    return {
      available: false,
      message: 'Amazon Books API endpoint is not configured.',
    };
  }

  return {
    available: true,
    message: 'Amazon Books API endpoint configured.',
  };
};
