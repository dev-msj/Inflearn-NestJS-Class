import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entities/posts.entity';
import { IsOptional, IsString } from 'class-validator';

// Pick, Omit, Partial -> Type 반환
// PickType, OmitType, PartialType -> 값을 반환

// PickType이 메타데이터를 복사하므로 PostsModel에 이미 class-validator 데코레이터가 적용되어 있음
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString()
  @IsOptional()
  image?: string;
}

/**
 * 이 방식에 대한 내 의견.
 *
 * 이는 SRP에 위배되는 코드라고 생각한다.
 * PostsModel은 db와 관련 있는 class라서 class-validator와 전혀 상관이 없다.
 * 그래서 중복되고 관리 효율이 좀 떨어지더라도 이 속성들을 CreatePostDto에 직접 정의해서 관리하는게 맞다고 생각한다.
 */
