import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from '../const/rules.enum';

export const ROLES_KEY = 'user_roles';

// role 정보를 받아서 metadata로 설정하는 커스텀 데코레이터
export const Roles = (role: RolesEnum) => SetMetadata(ROLES_KEY, role);
