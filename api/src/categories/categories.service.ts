import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Category[]> {
    // Return default categories + user's custom categories
    return await this.prisma.category.findMany({
      where: {
        OR: [{ isDefault: true }, { userId }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async create(name: string, userId: string): Promise<Category> {
    return await this.prisma.category.create({
      data: {
        name,
        userId,
        isDefault: false,
      },
    });
  }
}
