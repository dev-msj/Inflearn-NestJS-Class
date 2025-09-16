import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { PostsService } from 'src/posts/posts.service';

/**
 * NestJS Lifecycle 상 Middleware는 가장 먼저 실행된다.
 * 그러므로 저 수준의 request/response 전처리(쿠키/헤더 검사, 서드파티 미들웨어 연동 등)를 통해
 * 요청을 필요에 맞게 수정하여 일관된 상태로 전달하거나,
 * 요구 사항에 맞지 않는 요청들(앱 서비스인데 웹을 통해 요청했다거나 하는)을
 * 조기에 차단하는 역할에 적합하다.
 * 또한 최대한 가볍게 유지하는 것이 좋다.
 *
 * 하지만 강의에서는 PostId 및 Post 존재 여부 검사를 위해 사용했다.
 * 이는 DB에 접근하고 비즈니스 로직을 처리하는 서비스 레이어에서 책임을 가져야 할 부분으로
 * 미들웨어에서는 적합하지 않다고 생각한다.
 * 그냥 간단하게 사용법을 익히기 위한 예제 정도의 내용 정도로 생각하자.
 */
@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postsService: PostsService) {}
  async use(req: any, res: any, next: (error?: any) => void) {
    const postId = Number(req.params.postId);

    if (!postId) {
      throw new BadRequestException('Post ID는 필수로 입력해야 합니다.');
    }

    const postExists = await this.postsService.checkPostModelExists(postId);
    if (!postExists) {
      throw new BadRequestException('존재하지 않는 Post입니다.');
    }

    next();
  }
}
