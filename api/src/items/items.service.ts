import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../auth/supabase.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  private async checkWritePermission(listId: string, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: { members: true },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    // Check if user is owner
    if (list.ownerId === userId) {
      return; // Owner has all permissions
    }

    // Check if user is a member
    const member = list.members.find(m => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You do not have access to this list');
    }

    // Check if member has write permission
    if (member.role === 'READER') {
      throw new ForbiddenException('You do not have permission to modify items in this list');
    }
  }

  private async checkReadPermission(listId: string, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: { members: true },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found`);
    }

    // Check if user is owner or member (any role can read and toggle)
    const isOwner = list.ownerId === userId;
    const isMember = list.members.some(m => m.userId === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You do not have access to this list');
    }
  }

  async create(createItemDto: CreateItemDto, userId: string) {
    // Check write permission
    await this.checkWritePermission(createItemDto.listId, userId);

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

    // Check write permission
    await this.checkWritePermission(existingItem.listId, userId);

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
    const item = await this.findOne(id, userId);

    // Check write permission
    await this.checkWritePermission(item.listId, userId);

    await this.prisma.item.delete({
      where: { id },
    });

    return { message: 'Item deleted successfully' };
  }

  async toggleChecked(id: string, userId: string) {
    const item = await this.findOne(id, userId);

    // Check read permission (all roles including READER can toggle)
    await this.checkReadPermission(item.listId, userId);

    const updatedItem = await this.prisma.item.update({
      where: { id },
      data: { checked: !item.checked },
    });

    return updatedItem;
  }

  async updateQuantity(id: string, userId: string, quantity: number) {
    const item = await this.findOne(id, userId);

    // Check write permission for quantity changes
    await this.checkWritePermission(item.listId, userId);

    const updatedItem = await this.prisma.item.update({
      where: { id },
      data: { quantity },
    });

    return updatedItem;
  }

  async uploadImage(
    id: string,
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    // Check if user has access and write permission
    const item = await this.findOne(id, userId);
    await this.checkWritePermission(item.listId, userId);

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit.');
    }

    // Delete old image if exists
    if (item.imageUrl) {
      try {
        const oldPath = this.extractPathFromUrl(item.imageUrl);
        if (oldPath) {
          await this.supabase.deleteImage('item-images', oldPath);
        }
      } catch (error) {
        console.error('Failed to delete old image:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.originalname.split('.').pop() || 'jpg';
    const filename = `${userId}/${timestamp}-${randomStr}.${extension}`;

    // Upload to Supabase Storage
    const imageUrl = await this.supabase.uploadImage(
      'item-images',
      filename,
      file.buffer,
      file.mimetype,
    );

    // Update item with new image URL
    await this.prisma.item.update({
      where: { id },
      data: { imageUrl },
    });

    return { imageUrl };
  }

  async deleteImage(id: string, userId: string): Promise<{ message: string }> {
    // Check if user has access and write permission
    const item = await this.findOne(id, userId);
    await this.checkWritePermission(item.listId, userId);

    if (!item.imageUrl) {
      throw new NotFoundException('Item does not have an image');
    }

    // Delete from Supabase Storage
    try {
      const path = this.extractPathFromUrl(item.imageUrl);
      if (path) {
        await this.supabase.deleteImage('item-images', path);
      }
    } catch (error) {
      console.error('Failed to delete image from storage:', error);
      // Continue with database update even if storage deletion fails
    }

    // Update item to remove image URL
    await this.prisma.item.update({
      where: { id },
      data: { imageUrl: null },
    });

    return { message: 'Image deleted successfully' };
  }

  private extractPathFromUrl(url: string): string | null {
    try {
      // Extract path from Supabase URL
      // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
      const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
