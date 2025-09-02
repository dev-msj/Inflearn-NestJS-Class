import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional } from 'class-validator';

// Partial, PartialType은 모든 속성을 선택적(optional)으로 만들어준다.

/**
 * 현재 코드만 보면 "extends PartialType(CreatePostDto)"이 있고 없고의 차이가 전혀 없어 보인다.
 * 하지만 CreatePostDto가 변경될 경우, UpdatePostDto도 자동으로 변경된다.
 * 또한 다른 개발자들이 볼 때 UpdatePostDto는 CreatePostDto를 기반으로 구현됐다는 것을 쉽게 알 수 있다.
 * 그래서 지워도 상관은 없지만, 문맥상 남겨두는 것을 권장한다.
 */

// export class UpdatePostDto extends PickType(PostsModel, ['title', 'content']) {}
export class UpdatePostDto extends PartialType(CreatePostDto) {
  // @IsString() -> CreatePostDto가 PostsModel로부터 상속받은 validator를 동일하게 가져온다.
  @IsOptional()
  title?: string;

  // @IsString() -> CreatePostDto가 PostsModel로부터 상속받은 validator를 동일하게 가져온다.
  @IsOptional()
  content?: string;
}
