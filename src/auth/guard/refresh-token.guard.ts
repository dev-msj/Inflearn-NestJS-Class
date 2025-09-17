import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BearerTokenGuard } from './bearer-token.guard';

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. BearerTokenGuard의 canActivate 메서드를 호출하여 기본적인 토큰 검증을 수행한다.
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();

    if (request.isPublic) {
      return true;
    }

    // 2. Refresh token을 검증한다.
    if (request.tokenType !== 'refresh') {
      throw new UnauthorizedException('리프레시 토큰이 아닙니다.');
    }

    return true;
  }
}
