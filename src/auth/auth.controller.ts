import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/refresh-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { IsPublic } from './decorator/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  public postTokenAccess(@Headers('authorization') authorization: string) {
    const token = this.authService.extractTokenFromHeader(authorization, true);

    return { accessToken: this.authService.rotateToken(token, false) };
  }

  @Post('token/refresh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  public postTokenRefresh(@Headers('authorization') authorization: string) {
    const token = this.authService.extractTokenFromHeader(authorization, true);

    return { refreshToken: this.authService.rotateToken(token, true) };
  }

  @Post('login/email')
  @IsPublic()
  @UseGuards(BasicTokenGuard)
  public async postLoginEmail(@Headers('authorization') authorization: string) {
    const token = this.authService.extractTokenFromHeader(authorization, false);
    const credentials = this.authService.decodeBasicToken(token);
    return await this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  @IsPublic()
  public async postRegisterEmail(
    @Body() registerUserDto: RegisterUserDto,
    // @Body('email') email: string,
    // @Body('nickname') nickname: string,
    // // @Body('password', PasswordPipe) password: string,
    // @Body('password', new MaxLengthPipe(8, '비밀번호'), new MinLengthPipe(3)) // ","를 활용해 여러개의 파이프를 적용할 수 있다.
    // password: string,
  ) {
    return await this.authService.registerWithEmail(registerUserDto);
  }
}
