import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.categoriesService.findAll(user.id);
  }

  @Post()
  create(@Body('name') name: string, @CurrentUser() user: CurrentUserData) {
    return this.categoriesService.create(name, user.id);
  }
}
