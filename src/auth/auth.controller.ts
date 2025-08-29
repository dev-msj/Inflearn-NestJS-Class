import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordPipe } from './pipe/password.pipe';
import { MaxLengthPipe } from './pipe/max-length.pipe';
import { MinLengthPipe } from './pipe/min-length.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  public postTokenAccess(@Headers('authorization') authorization: string) {
    const token = this.authService.extractTokenFromHeader(authorization, true);

    return { accessToken: this.authService.rotateToken(token, false) };
  }

  @Post('token/refresh')
  public postTokenRefresh(@Headers('authorization') authorization: string) {
    const token = this.authService.extractTokenFromHeader(authorization, true);

    return { refreshToken: this.authService.rotateToken(token, true) };
  }

  @Post('login/email')
  public async postLoginEmail(@Headers('authorization') authorization: string) {
    const token = this.authService.extractTokenFromHeader(authorization, false);
    const credentials = this.authService.decodeBasicToken(token);
    return await this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  public async postRegisterEmail(
    @Body('email') email: string,
    @Body('nickname') nickname: string,
    // @Body('password', PasswordPipe) password: string,
    @Body('password', new MaxLengthPipe(8, '비밀번호'), new MinLengthPipe(3)) // ","를 활용해 여러개의 파이프를 적용할 수 있다.
    password: string,
  ) {
    return await this.authService.registerWithEmail({
      email,
      nickname,
      password,
    });
  }
}
