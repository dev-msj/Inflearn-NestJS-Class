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
import { PostsService } from './posts.service';
import { PostsModel } from './entities/posts.entity';

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
  public async getPostModels(): Promise<PostsModel[]> {
    return await this.postsService.getAllPostModels();
  }

  /**
   * [GET] http://localhost:3000/{store}/{resource}
   * - Query 사용
   * - store에서 요청된 resource를 가져온다.
   * - resource는 단수형 명사로 작성한다.
   */
  @Get(':id')
  public async getPostModel(@Param('id') id: string): Promise<PostsModel> {
    // +id를 통해 string 타입의 id를 number 타입으로 변환한다.
    return await this.postsService.getPostModelById(+id);
  }

  /**
   * [Post] http://localhost:3000/{store}
   * - Body 사용
   * - store에 새로운 resource를 생성한다.
   */
  @Post()
  public async postPostModel(
    @Body('authorId') authorId: number,
    @Body('title') title: string,
    @Body('content') content: string,
  ): Promise<PostsModel> {
    return await this.postsService.createPostModel(authorId, title, content);
  }

  /**
   * [Patch] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 수정한다.
   */
  @Patch(':id')
  public async patchPost(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ): Promise<boolean> {
    await this.postsService.updatePostModel(+id, title, content);

    return true;
  }

  /**
   * [Put] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 수정하거나 생성한다.
   */
  @Put(':id')
  public async putPost(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ): Promise<PostsModel> {
    return await this.postsService.upsertPostModel(+id, title, content);
  }

  /**
   * [Delete] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 삭제한다.
   */
  @Delete(':id')
  public async deletePost(@Param('id') id: string): Promise<number> {
    return await this.postsService.deletePostModelById(+id);
  }
}
