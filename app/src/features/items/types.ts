export interface Item {
  id: string;
  listId: string;
  title: string;
  quantity: number;
  unit?: string;
  notes?: string;
  category?: string;
  checked: boolean;
  position?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
