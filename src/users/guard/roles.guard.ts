import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/rules.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     * Roles decorator에 대한 metadata를 가져와야 한다.
     *
     * NestJS의 Reflector 기능이 제공하는 getAllAndOverride() 메서드를 사용한다.
     *
     * Reflector.getAllAndOverride() 메서드의 동작:
     * 1. 전달된 targets 배열을 순서대로 검사한다 [handler, class]
     * 2. handler(메서드) 레벨에 metadata가 있으면 그 값을 반환한다
     * 3. handler 레벨에 없으면 class 레벨에서 찾아 반환한다
     * 4. 둘 다 없으면 undefined를 반환한다
     *
     * 핵심: handler 레벨이 class 레벨보다 높은 우선순위를 가진다
     */
    const requiredRole = this.reflector.getAllAndOverride<string>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Roles Decorator가 설정되지 않은 경우
    if (!requiredRole) {
      return true;
    }

    // RolesGuard 전에 AccessTokenGuard를 필수로 사용해야 한다.
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException(`토큰을 제공해주세요!`);
    }

    if (user.role !== requiredRole) {
      throw new ForbiddenException(
        `이 작업을 수행할 권한이 없습니다. ${requiredRole} 권한이 필요합니다.`,
      );
    }

    return true;
  }
}
