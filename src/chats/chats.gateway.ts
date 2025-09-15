import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
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
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.exception-filter';
import { SocketBearerTokenGuard } from 'src/auth/guard/socket/socket-bearer-token.guard';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

// ws://localhost:3000/chats
@WebSocketGateway({ namespace: 'chats' })
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // OnGatewayDisconnect 인터페이스 구현
  // Client와의 연결이 끊어졌을 때 실행되는 메서드
  handleDisconnect(socket: Socket) {
    console.log(`on disconnect called: ${socket.id}`);
  }

  // OnGatewayInit 인터페이스 구현
  // Server를 Inject 받을 때 실행되는 메서드
  // Gateway가 초기화 됐을 때 실행할 수 있는 메서드
  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized');
  }

  // const io = Server(3000);
  // => 생성된 서버 객체를 주입 받은 변수
  @WebSocketServer()
  server: Server;

  // io.on('connection', () => {})
  // => client와의 연결을 위한 이벤트 리스너
  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called: ${socket.id}`);

    /**
     * 각각의 이벤트 리스너에 Guard를 사용한 토큰 인증 방식에는 문제가 있다.
     * Socket 통신은 Header의 값이 최초 연결 이후 변경할 수 없어서
     * 토큰이 만료되었을 때 재발급 받은 토큰으로 변경할 수 없기 때문이다.
     * 따라서 매번 토큰 갱신을 위해 연결을 끊고 다시 연결하는 방식을 사용해야 한다.
     *
     * 이러한 문제를 해결하기 위해서는
     * handleConnection 메서드에서 토큰을 검증하는 방식을 사용하여
     * 소켓이 연결될 때 한 번만 토큰을 검증하고,
     * 이후에는 토큰이 만료되더라도 연결이 유지되도록 할 수 있다.
     */
    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }

    // 기본적으로 HttpException을 던지도록 구현되어 있으므로
    // WsException으로 변환하여 던져야 한다.
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;
    } catch (e) {
      socket.disconnect();
    }
  }

  // 유저들의 ID 목록을 받아 DB에 채팅방 정보 생성
  @SubscribeMessage('create_chat')
  /**
   * Socket은 main에서 선언된 Global Validation Pipe가 적용되지 않는다.
   * 따라서 각 SubscribeMessage 이벤트마다
   * 개별적으로 Validation Pipe를 적용해 주어야 한다.
   */
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  // nestjs는 기본적으로 HttpException을 던지도록 구현되어 있으므로
  // Filter를 통해 WsException으로 변환하여 던져야 한다.
  @UseFilters(SocketCatchHttpExceptionFilter)
  // Socket 통신에서 JWT 토큰을 검증하기 위한 Guard
  // @UseGuards(SocketBearerTokenGuard)
  async createChat(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    await this.chatsService.createChat(createChatDto);
  }

  @SubscribeMessage('enter_chat')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // @UseGuards(SocketBearerTokenGuard)
  async enterChat(
    // join할 채팅방 ID 배열
    @MessageBody() enterChatDto: EnterChatDto,
    // Server와 연결된 Socket 객체
    @ConnectedSocket() socket: Socket & { user: UsersModel },
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
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // @UseGuards(SocketBearerTokenGuard)
  async sendMessage(
    @MessageBody() createMessagesDto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
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

    const message = await this.messagesService.createMessage(
      createMessagesDto,
      socket.user.id,
    );

    // 0. server에 연결된 모든 client들에게 브로드캐스트
    this.server.emit(
      'receive_message',
      message.message + ' - broadcast from server',
    );

    // 1. 메시지를 보낸 client에게만 응답
    socket.emit('ack', ' - response only to requester in socket');

    // 2. 요청자를 제외한 모든 client들에게 브로드캐스트
    socket.broadcast.emit(
      'broadcast_from_socket',
      message.message + ' - broadcast from socket except requester',
    );

    // 3. Server 객체에서 특정 방에 브로드캐스트
    // 해당 방에 있는 모든 client들에게 메시지가 전송된다. (요청한 client 포함)
    this.server
      .in(`chat_${message.chat.id}`)
      .emit(
        'broadcast_from_server_to_room',
        message.message + ' - broadcast from server to all clients in a room',
      );

    // 4. Socket 객체에서 특정 방에 브로드캐스트
    // 해당 방에 있는 모든 client들에게 메시지가 전송된다. (요청한 client 제외)
    socket
      .to(`chat_${message.chat.id}`)
      .emit(
        'broadcast_from_socket_to_room',
        message.message +
          ' - broadcast from socket to room to all clients except requester',
      );

    /**
     * to()와 in()의 차이점
     *
     * 이 2개의 메서드는 기능적으로는 동일하다.
     * 하지만 메서드가 굳이 2개로 나뉘어지는 것은 의미론적 차이가 있기 때문이다.
     *
     * in(): "~안에 있는" 이라는 의미로, 특정 범위나 컨텍스트 내에서의 작업을 표현.
     *       ex) Server가 Room 안의 모든 Client들에게 메시지를 보낸다.
     * to(): "~에게" 라는 의미로, 특정 대상에게 전달한다는 개념을 표현.
     *      ex) Server가 Client의 요청에 의해 요청자를 제외한 Room 안의 모든 Client들에게 메시지를 보낸다.
     *
     * 둘 다 같은 결과를 가져오지만, 코드의 의도를 더 명확하게 표현할 수 있다.
     */
  }
}
