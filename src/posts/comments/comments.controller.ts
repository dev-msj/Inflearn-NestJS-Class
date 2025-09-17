import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { IsPublic } from 'src/auth/decorator/is-public.decorator';
import { IsCommentOwnerOrAdminGuard } from './guard/is-comment-owner-or-admin.guard';

/**
 * 1. entity 생성
 *    author -> 작성자
 *    post -> 귀속되는 포스트
 *    comment -> 실제 댓글 내용
 *    likeCount -> 좋아요 수
 *
 * 2. GET() pagination
 * 3. GET('commentId') -> 특정 댓글 조회
 * 4. POST() -> 댓글 작성
 * 5. PATCH('commentId') -> 댓글 수정 (작성자만 가능)
 * 6. DELETE('commentId') -> 댓글 삭제 (작성자만 가능)
 */
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @IsPublic()
  public async getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() paginateCommentDto,
  ) {
    return await this.commentsService.pagination(postId, paginateCommentDto);
  }

  @Get(':commentId')
  @IsPublic()
  public async getComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return await this.commentsService.getCommentById(postId, commentId);
  }

  @Post()
  public async postComment(
    @User() user: UsersModel,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentsDto: CreateCommentsDto,
  ) {
    return await this.commentsService.createComment(
      user,
      postId,
      createCommentsDto,
    );
  }

  @Patch(':commentId')
  @UseGuards(IsCommentOwnerOrAdminGuard)
  public async patchComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentsDto: UpdateCommentsDto,
  ) {
    return await this.commentsService.updateComment(
      postId,
      commentId,
      updateCommentsDto,
    );
  }

  @Delete(':commentId')
  @UseGuards(IsCommentOwnerOrAdminGuard)
  public async deleteComment(
    @User() user: UsersModel,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return await this.commentsService.deleteComment(user, postId, commentId);
  }
}
