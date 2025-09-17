import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entities/posts.entity';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/users/decorator/rules.decorator';
import { RolesEnum } from 'src/users/const/rules.enum';
import { IsPublic } from 'src/auth/decorator/is-public.decorator';
import { IsPostOwnerOrAdminGuard } from './guard/is-post-owner-or-admin.guard';

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
  @IsPublic()
  // @UseInterceptors(LogInterceptor)
  // @UseFilters(HttpExceptionFilter)
  public async getPostModels(@Query() paginatePostDto: PaginatePostDto) {
    // return await this.postsService.getAllPostModels();
    return await this.postsService.paginatePosts(paginatePostDto);
  }

  @Post('generate')
  public async generatePostModels(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);

    return true;
  }

  /**
   * [GET] http://localhost:3000/{store}/{resource}
   * - Query 사용
   * - store에서 요청된 resource를 가져온다.
   * - resource는 단수형 명사로 작성한다.
   */
  @Get(':postId')
  @IsPublic()
  public async getPostModel(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<PostsModel> {
    return await this.postsService.getPostModelByIdOrUser(postId);
  }

  /**
   * [Post] http://localhost:3000/{store}
   * - Body 사용
   * - store에 새로운 resource를 생성한다.
   */
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  public async postPostModel(
    @User('id') userId: number,
    @Body() createPostDto: CreatePostDto,
    // @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean, // DefaultValuePipe를 통해 기본값을 설정할 수 있다.
  ): Promise<PostsModel> {
    return await this.postsService.createPostModel(userId, createPostDto);
  }

  /**
   * [Patch] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 수정한다.
   */
  @Patch(':postId')
  @UseGuards(IsPostOwnerOrAdminGuard)
  public async patchPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<boolean> {
    await this.postsService.updatePostModel(postId, updatePostDto);

    return true;
  }

  /**
   * [Put] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 수정하거나 생성한다.
   */
  @Put(':postId')
  @UseGuards(IsPostOwnerOrAdminGuard)
  public async putPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostsModel> {
    return await this.postsService.upsertPostModel(postId, updatePostDto);
  }

  /**
   * [Delete] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 삭제한다.
   */
  @Delete(':postId')
  @Roles(RolesEnum.ADMIN)
  public async deletePost(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<number> {
    return await this.postsService.deletePostModelById(postId);
  }
}
