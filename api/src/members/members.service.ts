import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../auth/supabase.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { InvitationStatus } from '../../generated/prisma';

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  // Get all members and invitations for a list
  async getListMembers(listId: string, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: {
        members: true,
        invitations: true,
      },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    // Check if user is owner or member
    const isOwner = list.ownerId === userId;
    const isMember = list.members.some(m => m.userId === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You do not have access to this list');
    }

    // Only owner can see members management
    if (!isOwner) {
      throw new ForbiddenException('Only the owner can view members');
    }

    return {
      members: list.members,
      invitations: list.invitations,
    };
  }

  // Search user by email
  async searchUserByEmail(email: string) {
    const supabase = this.supabaseService.getClient();

    // Query Supabase admin API to find user by email
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw new BadRequestException('Failed to search users');
    }

    const user = data.users.find(u => u.email === email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  // Send invitation
  async sendInvitation(listId: string, userId: string, dto: CreateInvitationDto) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: {
        members: true,
        invitations: true,
      },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    // Only owner can invite
    if (list.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can invite members');
    }

    // Find invitee by email in Supabase
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw new BadRequestException('Failed to search users');
    }

    const inviteeUser = data.users.find(u => u.email === dto.inviteeEmail);

    if (!inviteeUser) {
      throw new NotFoundException(`User with email ${dto.inviteeEmail} not found`);
    }

    const inviteeId = inviteeUser.id;

    // Prevent owner from inviting themselves
    if (inviteeId === userId) {
      throw new BadRequestException('You cannot invite yourself');
    }

    // Check if user is already a member
    const isAlreadyMember = list.members.some(m => m.userId === inviteeId);
    if (isAlreadyMember) {
      throw new ConflictException('User is already a member of this list');
    }

    // Check if there's already a pending invitation
    const existingInvitation = list.invitations.find(
      inv => inv.inviteeId === inviteeId && inv.status === InvitationStatus.PENDING,
    );
    if (existingInvitation) {
      throw new ConflictException('A pending invitation already exists for this user');
    }

    // Create invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        listId,
        inviterId: userId,
        inviteeId,
        inviteeEmail: dto.inviteeEmail,
        role: dto.role,
        status: InvitationStatus.PENDING,
      },
    });

    return invitation;
  }

  // Change member role
  async updateMemberRole(
    listId: string,
    memberId: string,
    userId: string,
    dto: UpdateMemberRoleDto,
  ) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    // Only owner can change roles
    if (list.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can change member roles');
    }

    const member = await this.prisma.listMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.listId !== listId) {
      throw new NotFoundException('Member not found');
    }

    const updatedMember = await this.prisma.listMember.update({
      where: { id: memberId },
      data: { role: dto.role },
    });

    return updatedMember;
  }

  // Remove member
  async removeMember(listId: string, memberId: string, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    // Only owner can remove members
    if (list.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can remove members');
    }

    const member = await this.prisma.listMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.listId !== listId) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.listMember.delete({
      where: { id: memberId },
    });

    return { message: 'Member removed successfully' };
  }

  // Get my invitations
  async getMyInvitations(userId: string) {
    const invitations = await this.prisma.invitation.findMany({
      where: { inviteeId: userId },
      include: {
        list: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations;
  }

  // Accept or decline invitation
  async updateInvitation(invitationId: string, userId: string, dto: UpdateInvitationDto) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Only invitee can accept/decline
    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException('You cannot modify this invitation');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been processed');
    }

    // If accepted, create a list member
    if (dto.status === InvitationStatus.ACCEPTED) {
      const userEmail = invitation.inviteeEmail;
      if (!userEmail) throw new NotFoundException('User not found');
      await this.prisma.listMember.create({
        data: {
          listId: invitation.listId,
          userId: invitation.inviteeId,
          userEmail,
          role: invitation.role,
        },
      });
    }

    // Delete the invitation after processing (accept or decline)
    await this.prisma.invitation.delete({
      where: { id: invitationId },
    });

    return {
      message:
        dto.status === InvitationStatus.ACCEPTED
          ? 'Invitation accepted successfully'
          : 'Invitation declined successfully',
      status: dto.status,
    };
  }

  // Cancel invitation (owner only)
  async cancelInvitation(listId: string, invitationId: string, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    // Only owner can cancel invitations
    if (list.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can cancel invitations');
    }

    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.listId !== listId) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.invitation.delete({
      where: { id: invitationId },
    });

    return { message: 'Invitation cancelled successfully' };
  }
}
