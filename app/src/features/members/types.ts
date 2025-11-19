export type Role = 'OWNER' | 'WRITER' | 'READER';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface ListMember {
  id: string;
  listId: string;
  userId: string;
  role: Role;
  addedAt: string;
}

export interface Invitation {
  id: string;
  listId: string;
  inviterId: string;
  inviteeId: string;
  inviteeEmail: string;
  role: Role;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  list?: {
    id: string;
    title: string;
    ownerId: string;
  };
}

export interface ListMembersData {
  members: ListMember[];
  invitations: Invitation[];
}
