import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BearerTokenGuard } from './bearer-token.guard';

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. BearerTokenGuard의 canActivate 메서드를 호출하여 기본적인 토큰 검증을 수행한다.
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();

    if (request.isPublic) {
      return true;
    }

    // 2. Access token을 검증한다.
    if (request.tokenType !== 'access') {
      console.log(request.tokenType);
      throw new UnauthorizedException('액세스 토큰이 아닙니다.');
    }

    return true;
  }
}
