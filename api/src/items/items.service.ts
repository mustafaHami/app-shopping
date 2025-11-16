import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto, userId: string) {
    // Check if user has access to the list
    const list = await this.prisma.list.findUnique({
      where: { id: createItemDto.listId },
      include: { members: true },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${createItemDto.listId} not found`);
    }

    const hasAccess =
      list.ownerId === userId || list.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this list');
    }

    // Check for duplicate item title in the same list
    const existingItem = await this.prisma.item.findFirst({
      where: {
        listId: createItemDto.listId,
        title: createItemDto.title,
      },
    });

    if (existingItem) {
      throw new ConflictException(
        `An item with title "${createItemDto.title}" already exists in this list`,
      );
    }

    const item = await this.prisma.item.create({
      data: {
        title: createItemDto.title,
        quantity: createItemDto.quantity,
        unit: createItemDto.unit,
        notes: createItemDto.notes,
        category: createItemDto.category,
        checked: createItemDto.checked ?? false,
        listId: createItemDto.listId,
      },
    });

    return item;
  }

  async findAllByList(listId: string, userId: string) {
    // Check if user has access to the list
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: { members: true },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    const hasAccess =
      list.ownerId === userId || list.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this list');
    }

    const items = await this.prisma.item.findMany({
      where: { listId },
      orderBy: [{ checked: 'asc' }, { createdAt: 'desc' }],
    });

    return items;
  }

  async findOne(id: string, userId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: { list: { include: { members: true } } },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    const hasAccess =
      item.list.ownerId === userId || item.list.members.some(member => member.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this item');
    }

    return item;
  }

  async update(id: string, userId: string, updateItemDto: UpdateItemDto) {
    // Check if user has access
    const existingItem = await this.findOne(id, userId);

    // If title is being updated, check for duplicate title in the same list
    if (updateItemDto.title && updateItemDto.title !== existingItem.title) {
      const duplicateItem = await this.prisma.item.findFirst({
        where: {
          listId: existingItem.listId,
          title: updateItemDto.title,
          id: { not: id }, // Exclude the current item
        },
      });

      if (duplicateItem) {
        throw new ConflictException(
          `An item with title "${updateItemDto.title}" already exists in this list`,
        );
      }
    }

    const updatedItem = await this.prisma.item.update({
      where: { id },
      data: updateItemDto,
    });

    return updatedItem;
  }

  async remove(id: string, userId: string) {
    // Check if user has access
    await this.findOne(id, userId);

    await this.prisma.item.delete({
      where: { id },
    });

    return { message: 'Item deleted successfully' };
  }

  async toggleChecked(id: string, userId: string) {
    const item = await this.findOne(id, userId);

    const updatedItem = await this.prisma.item.update({
      where: { id },
      data: { checked: !item.checked },
    });

    return updatedItem;
  }
}
