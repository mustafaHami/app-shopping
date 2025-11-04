export interface Category {
  id: string;
  name: string;
  userId: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
