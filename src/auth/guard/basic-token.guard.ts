import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. request 객체를 통해 authorization header로부터 토큰을 가져온다.
    const request = context.switchToHttp().getRequest();

    // 2. 헤더로부터 토큰을 추출한다.
    const rawToken = request.headers['authorization'];
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    // 3. 토큰을 디코드하여 email과 password를 추출한다.
    const { email, password } = await this.authService.decodeBasicToken(token);

    // 4. 추출한 email과 password를 이용해서 사용자를 가져온다.
    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    // 5. 찾아낸 사용자를 1의 request 객체에 추가한다.
    request.user = user;

    return true;
  }
}
