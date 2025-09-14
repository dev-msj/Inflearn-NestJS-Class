import { ChatsGateway } from './chats.gateway';
import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { CommonModule } from 'src/common/common.module';
import { ChatsModel } from './entities/chats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages/entities/messages.service';
import { MessagesModel } from './messages/entities/messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatsModel, MessagesModel]),
    CommonModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsGateway, ChatsService, MessagesService],
})
export class ChatsModule {}
