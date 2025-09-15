import { UsersService } from 'src/users/users.service';
import { AuthService } from './../../auth.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SocketBearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient();
    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];

    if (!rawToken) {
      throw new WsException('토큰이 존재하지 않습니다.');
    }

    // 기본적으로 HttpException을 던지도록 구현되어 있으므로
    // WsException으로 변환하여 던져야 한다.
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);

      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;
      socket.token = token;
      socket.tokenType = payload.type;

      return true;
    } catch (e) {
      throw new WsException('유효하지 않은 토큰입니다.');
    }
  }
}
