import { ChatsGateway } from './chats.gateway';
import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { CommonModule } from 'src/common/common.module';
import { ChatsModel } from './entities/chats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages/entities/messages.service';
import { MessagesModel } from './messages/entities/messages.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatsModel, MessagesModel]),
    CommonModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsGateway, ChatsService, MessagesService],
})
export class ChatsModule {}
