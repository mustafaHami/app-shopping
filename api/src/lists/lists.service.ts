import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../auth/supabase.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class ListsService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async create(createListDto: CreateListDto, userId: string) {
    const list = await this.prisma.list.create({
      data: {
        title: createListDto.title,
        description: createListDto.description,
        ownerId: userId,
      },
      include: {
        items: true,
        members: true,
        invitations: true,
      },
    });

    // Send invitations if provided
    const invitationResults: { pseudonym: string; success: boolean; error?: string }[] = [];

    if (createListDto.invitations && createListDto.invitations.length > 0) {
      const supabase = this.supabaseService.getClient();
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const allUsers = usersData?.users || [];

      for (const inv of createListDto.invitations) {
        const inviteeUser = allUsers.find(u => u.user_metadata?.pseudonym === inv.inviteePseudonym);

        if (!inviteeUser) {
          invitationResults.push({
            pseudonym: inv.inviteePseudonym,
            success: false,
            error: 'User not found',
          });
          continue;
        }

        if (inviteeUser.id === userId) {
          invitationResults.push({
            pseudonym: inv.inviteePseudonym,
            success: false,
            error: 'Cannot invite yourself',
          });
          continue;
        }

        try {
          await this.prisma.invitation.create({
            data: {
              listId: list.id,
              inviterId: userId,
              inviteeId: inviteeUser.id,
              inviteeEmail: inviteeUser.email,
              inviteePseudonym: inviteeUser.user_metadata?.pseudonym || inv.inviteePseudonym,
              role: inv.role,
              status: InvitationStatus.PENDING,
            },
          });
          invitationResults.push({ pseudonym: inv.inviteePseudonym, success: true });
        } catch {
          invitationResults.push({
            pseudonym: inv.inviteePseudonym,
            success: false,
            error: 'Failed to create invitation',
          });
        }
      }
    }

    // Re-fetch list with invitations
    const updatedList = await this.prisma.list.findUnique({
      where: { id: list.id },
      include: {
        items: true,
        members: true,
        invitations: true,
      },
    });

    return {
      ...updatedList,
      invitationResults,
    };
  }

  async findAll(userId: string) {
    const lists = await this.prisma.list.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        items: true,
        members: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Add user role to each list
    return lists.map(list => {
      let userRole: 'OWNER' | 'READER' | 'WRITER' = 'READER';

      if (list.ownerId === userId) {
        userRole = 'OWNER';
      } else {
        const member = list.members.find(m => m.userId === userId);
        if (member) {
          userRole = member.role as 'READER' | 'WRITER';
        }
      }

      return {
        ...list,
        userRole,
      };
    });
  }

  async findOne(id: string, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id },
      include: {
        items: true,
        members: true,
      },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${id} not found`);
    }

    // Check if user has access (owner or member)
    const hasAccess =
      list.ownerId === userId || list.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this list');
    }

    // Determine user role
    let userRole: 'OWNER' | 'READER' | 'WRITER' = 'READER';

    if (list.ownerId === userId) {
      userRole = 'OWNER';
    } else {
      const member = list.members.find(m => m.userId === userId);
      if (member) {
        userRole = member.role as 'READER' | 'WRITER';
      }
    }

    return {
      ...list,
      userRole,
    };
  }

  async update(id: string, userId: string, updateListDto: UpdateListDto) {
    // First check if list exists and user has access
    await this.findOne(id, userId);

    const updatedList = await this.prisma.list.update({
      where: { id },
      data: {
        title: updateListDto.title,
        description: updateListDto.description,
      },
      include: {
        items: true,
        members: true,
      },
    });

    return updatedList;
  }

  async remove(id: string, userId: string) {
    // First check if list exists and user has access
    const list = await this.findOne(id, userId);

    // Only the owner can delete the list
    if (list.ownerId !== userId) {
      throw new ForbiddenException('Only the list owner can delete the list');
    }

    await this.prisma.list.delete({
      where: { id },
    });

    return { message: 'List deleted successfully' };
  }
}
