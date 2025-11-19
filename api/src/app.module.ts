import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ListsModule } from './lists/lists.module';
import { ItemsModule } from './items/items.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [PrismaModule, AuthModule, ListsModule, ItemsModule, CategoriesModule, MembersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
