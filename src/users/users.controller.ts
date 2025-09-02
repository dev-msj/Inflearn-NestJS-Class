import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  // -> 매번 컨트롤러에서 선언하는 것은 휴먼 미스테이크가 발생할 수 있음.
  // -> AppModule을 통해 전역으로 설정하는 것이 좋음.
  /**
   * serialization -> 직렬화
   * -> 현재 시스템에서 사용되는 데이터의 구조를 다른 시스템에서도 쉽게 사용할 수 있는 포맷으로 변환
   * -> class의 object에서 JSON 포맷으로 변환
   * deserialization -> 역직렬화
   */
  public async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  // @Post()
  // public async createUser(
  //   @Body('nickname') nickname: string,
  //   @Body('email') email: string,
  //   @Body('password') password: string,
  // ) {
  //   return await this.usersService.createUser({ nickname, email, password });
  // }
}
