export interface InvitationResult {
  pseudonym: string;
  success: boolean;
  error?: string;
}

export interface List {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  userRole?: 'OWNER' | 'WRITER' | 'READER';
  items?: Item[];
  members?: ListMember[];
  invitationResults?: InvitationResult[];
}

export interface Item {
  id: string;
  listId: string;
  title: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  category?: string;
  checked: boolean;
  position?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListMember {
  id: string;
  listId: string;
  userId: string;
  role: 'OWNER' | 'EDITOR';
  addedAt: string;
}
