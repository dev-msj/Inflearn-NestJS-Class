import { CreateMessagesDto } from './../dto/create-messages.dto';
import { PaginateMessagesDto } from './../dto/paginate-messages.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesModel } from './messages.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly commonService: CommonService,
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
  ) {}

  public async createMessage(createMessagesDto: CreateMessagesDto) {
    const messageEntity = this.messagesRepository.create({
      chat: { id: createMessagesDto.chatId },
      author: { id: createMessagesDto.authorId },
      message: createMessagesDto.message,
    });
    const message = await this.messagesRepository.save(messageEntity);

    return this.messagesRepository.findOne({
      where: { id: message.id },
      relations: ['chat'],
    });
  }

  public async paginateMessages(paginateMessagesDto: PaginateMessagesDto) {
    return this.commonService.paginate<MessagesModel>(
      paginateMessagesDto,
      this.messagesRepository,
      {},
      'messages',
    );
  }
}
