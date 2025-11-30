import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateItemQuantityDto } from './dto/update-item-quantity.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('items')
@UseGuards(AuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto, @CurrentUser() user: CurrentUserData) {
    return this.itemsService.create(createItemDto, user.id);
  }

  @Get('list/:listId')
  findAllByList(@Param('listId') listId: string, @CurrentUser() user: CurrentUserData) {
    return this.itemsService.findAllByList(listId, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.itemsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.update(id, user.id, updateItemDto);
  }

  @Patch(':id/toggle')
  toggleChecked(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    console.log(`Toggling item ${id} for user ${user.id}`);
    return this.itemsService.toggleChecked(id, user.id);
  }

  @Patch(':id/quantity')
  updateQuantity(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateItemQuantityDto: UpdateItemQuantityDto,
  ) {
    return this.itemsService.updateQuantity(id, user.id, updateItemQuantityDto.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.itemsService.remove(id, user.id);
  }
}
