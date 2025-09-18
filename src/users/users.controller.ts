import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesEnum } from './const/rules.enum';
import { Roles } from './decorator/rules.decorator';
import { User } from './decorator/user.decorator';
import { UsersModel } from './entities/users.entity';

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
  @Roles(RolesEnum.ADMIN)
  public async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get('follow/me')
  public async getFollowers(
    @User() user: UsersModel,
    @Query('includeNotConfirm', new DefaultValuePipe(false), ParseBoolPipe)
    includeNotConfirm: boolean = false,
  ) {
    return await this.usersService.getFollowers(user.id, includeNotConfirm);
  }

  @Post('follow/:followeeId')
  public async followUser(
    @User() user: UsersModel,
    @Param('followeeId', ParseIntPipe) followeeId: number,
  ): Promise<boolean> {
    await this.usersService.followUser(user.id, followeeId);

    return true;
  }

  @Patch('follow/:followerId/confirm')
  public async patchConfirmFollowConfirm(
    @User() user: UsersModel,
    @Param('followerId', ParseIntPipe) followerId: number,
  ): Promise<boolean> {
    return await this.usersService.confirmFollow(followerId, user.id);
  }

  @Delete('follow/:followeeId')
  public async deleteFollow(
    @User() user: UsersModel,
    @Param('followeeId', ParseIntPipe) followeeId: number,
  ): Promise<boolean> {
    return await this.usersService.deleteFollow(user.id, followeeId);
  }
}
