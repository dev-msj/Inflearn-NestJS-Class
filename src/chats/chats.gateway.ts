import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto } from './messages/dto/create-messages.dto';
import { MessagesService } from './messages/entities/messages.service';

// ws://localhost:3000/chats
@WebSocketGateway({ namespace: 'chats' })
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
  ) {}

  // const io = Server(3000);
  // => 생성된 서버 객체를 주입 받은 변수
  @WebSocketServer()
  server: Server;

  // io.on('connection', () => {})
  // => client와의 연결을 위한 이벤트 리스너
  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }

  // 유저들의 ID 목록을 받아 DB에 채팅방 정보 생성
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    await this.chatsService.createChat(createChatDto);
  }

  @SubscribeMessage('enter_chat')
  async enterChat(
    // join할 채팅방 ID 배열
    @MessageBody() enterChatDto: EnterChatDto,
    // Server와 연결된 Socket 객체
    @ConnectedSocket() socket: Socket,
  ) {
    // DB에 존재하는 chatId인지 확인
    for (const chatId of enterChatDto.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);
      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 chat입니다. chatId: ${chatId}`,
        });
      }
    }

    // socket.join();
    // => 특정 room에 참여시키는 메서드
    socket.join(enterChatDto.chatIds.map((chatId) => `chat_${chatId}`));
  }

  /**
   * 클라이언트가 'send_message' 이벤트를 전송했을 때 실행되는 핸들러
   *
   * 순수 Socket.IO에서는 다음과 같이 작성:
   * socket.on('send_message', (data) => { ... });
   *
   * NestJS에서는 @SubscribeMessage 데코레이터를 사용하여
   * 이벤트 리스너를 선언적으로 정의.
   */
  @SubscribeMessage('send_message')
  async chatMessage(
    @MessageBody() createMessagesDto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chatExists = await this.chatsService.checkIfChatExists(
      createMessagesDto.chatId,
    );
    if (!chatExists) {
      throw new WsException({
        code: 100,
        message: `존재하지 않는 chat입니다. chatId: ${createMessagesDto.chatId}`,
      });
    }

    // client로부터 받은 메시지 출력
    console.log(createMessagesDto.message + ' from client');

    const message = await this.messagesService.createMessage(createMessagesDto);

    // 0. server에 연결된 모든 client들에게 메시지 전송
    this.server.emit('receive_message', message.message + ' from server');

    // 1. 메시지를 보낸 client에게만 응답
    socket.emit('ack', 'Message received');

    // 2. 요청자를 제외한 모든 client들에게 브로드캐스트
    socket.broadcast.emit(
      'broadcast_all',
      message.message + ' from broadcast all',
    );

    // 3. Server 객체에서 특정 방에 브로드캐스트
    // 해당 방에 있는 모든 client들에게 메시지가 전송된다. (요청한 client 포함)
    this.server
      .in(`chat_${message.chat.id}`)
      .emit('receive_chat_server', message.message + ' from chat server');

    // 4. Socket 객체에서 특정 방에 브로드캐스트
    // 해당 방에 있는 모든 client들에게 메시지가 전송된다. (요청한 client 제외)
    socket
      .to(`chat_${message.chat.id}`)
      .emit('receive_chat_socket', message.message + ' from chat socket');

    /**
     * to()와 in()의 차이점
     *
     * 이 2개의 메서드는 기능적으로는 동일하다.
     * 하지만 메서드가 굳이 2개로 나뉘어지는 것은 의미론적 차이가 있기 때문이다.
     *
     * in(): "~안에 있는" 이라는 의미로, 특정 범위나 컨텍스트 내에서의 작업을 표현
     * to(): "~에게" 라는 의미로, 특정 대상에게 전달한다는 개념을 표현
     *
     * 둘 다 같은 결과를 가져오지만, 코드의 의도를 더 명확하게 표현할 수 있다.
     */
  }
}
