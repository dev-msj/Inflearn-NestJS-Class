import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatsModel } from './entities/chats.entity';
import { CommonService } from 'src/common/common.service';
import { PaginateChatDto } from './dto/paginate-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly commonService: CommonService,
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
  ) {}

  public async createChat(createChatDto: CreateChatDto): Promise<ChatsModel> {
    const chat = await this.chatsRepository.save({
      users: createChatDto.userIds.map((id) => ({ id })),
    });

    return this.chatsRepository.findOne({
      where: { id: chat.id },
    });
  }

  public async paginateChats(paginateChatDto: PaginateChatDto) {
    return this.commonService.paginate<ChatsModel>(
      paginateChatDto,
      this.chatsRepository,
      {},
      'chats',
    );
  }

  public async checkIfChatExists(chatId: number): Promise<boolean> {
    return await this.chatsRepository.exists({
      where: { id: chatId },
    });
  }
}
