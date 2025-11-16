import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

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
      },
    });

    return list;
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

    return lists;
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

    return list;
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
