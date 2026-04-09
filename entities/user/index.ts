import type { User } from '@/types';

export const getInitials = (user: User) =>
  user.name
    .split(' ')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
