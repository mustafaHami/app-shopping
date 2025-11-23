import type { List } from '@/src/features/lists/types';

export type UserRole = 'OWNER' | 'WRITER' | 'READER';

export const canManageMembers = (list?: List): boolean => {
  return list?.userRole === 'OWNER';
};

export const canAddEditDeleteItems = (list?: List): boolean => {
  return list?.userRole === 'OWNER' || list?.userRole === 'WRITER';
};

export const canCheckItems = (list?: List): boolean => {
  return list?.userRole === 'OWNER' || list?.userRole === 'WRITER' || list?.userRole === 'READER';
};

export const canViewItems = (list?: List): boolean => {
  return !!list?.userRole;
};

export const isOwner = (list?: List): boolean => list?.userRole === 'OWNER';
export const isWriter = (list?: List): boolean => list?.userRole === 'WRITER';
export const isReader = (list?: List): boolean => list?.userRole === 'READER';
