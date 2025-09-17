import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorator/is-public.decorator';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. request 객체를 통해 authorization header로부터 토큰을 가져온다.
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      request.isPublic = isPublic;

      return true;
    }

    // 2. 헤더로부터 토큰을 추출한다.
    const rawToken = request.headers['authorization'];
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, true);

    // 3. 토큰을 검증한다.
    const payload = await this.authService.verifyToken(token);

    // 4. 유저 정보를 읽어온다.
    const user = await this.usersService.getUserByEmail(payload.email);

    // 5. 토큰과 유저 정보를 1의 request 객체에 추가한다.
    request.token = token;
    request.tokenType = payload.type;
    request.user = user;

    return true;
  }
}
