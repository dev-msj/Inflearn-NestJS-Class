import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { PostModel, PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * [GET] http://localhost:3000/{store}
   * - Query 사용
   * - store에 있는 모든 resource를 가져온다.
   * - store는 복수형 명사로 작성한다.
   */
  @Get()
  public getPostModels(): PostModel[] {
    return this.postsService.getAllPostModels();
  }

  /**
   * [GET] http://localhost:3000/{store}/{resource}
   * - Query 사용
   * - store에서 요청된 resource를 가져온다.
   * - resource는 단수형 명사로 작성한다.
   */
  @Get(':id')
  public getPostModel(@Param('id') id: string): PostModel {
    return this.postsService.getPostModelById(+id);
  }

  /**
   * [Post] http://localhost:3000/{store}
   * - Body 사용
   * - store에 새로운 resource를 생성한다.
   */
  @Post()
  public postPostModel(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ): PostModel {
    return this.postsService.createPostModel(author, title, content);
  }

  /**
   * [Patch] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 수정한다.
   */
  @Patch(':id')
  public patchPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ): PostModel {
    return this.postsService.updatePostModel(+id, author, title, content);
  }

  /**
   * [Put] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 수정하거나 생성한다.
   */
  @Put(':id')
  public putPost(
    @Param('id') id: string,
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ): PostModel {
    return this.postsService.upsertPostModel(+id, author, title, content);
  }

  /**
   * [Delete] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 삭제한다.
   */
  @Delete(':id')
  public deletePost(@Param('id') id: string): number {
    return this.postsService.deletePostModelById(+id);
  }
}
