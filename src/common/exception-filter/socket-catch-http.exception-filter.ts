import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient();

    // 클라이언트에게 에러 메시지 전송
    socket.emit('exception', {
      status: exception.getStatus(),
      data: exception.getResponse(),
      message: exception.message,
    });
  }
}
