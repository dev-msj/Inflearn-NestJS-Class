import { CreateCommentsDto } from './dto/create-comments.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entities/comments.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { UsersModel } from 'src/users/entities/users.entity';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { PostsService } from '../posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
    private readonly postsService: PostsService,
  ) {}

  public async pagination(
    postId: number,
    paginateCommentsDto: PaginateCommentsDto,
  ) {
    return await this.commonService.paginate<CommentsModel>(
      paginateCommentsDto,
      this.commentsRepository,
      {
        where: { post: { id: postId } },
      },
      `posts/${postId}/comments`,
    );
  }

  public async getCommentById(
    postId: number,
    commentId: number,
  ): Promise<CommentsModel> {
    try {
      return await this.commentsRepository.findOneOrFail({
        where: { id: commentId, post: { id: postId } },
        relations: { author: true },
      });
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new BadRequestException('댓글을 찾을 수 없습니다.');
      }

      throw new InternalServerErrorException('댓글 조회에 실패했습니다.');
    }
  }

  public async createComment(
    user: UsersModel,
    postId: number,
    createCommentsDto: CreateCommentsDto,
  ): Promise<CommentsModel> {
    const post = await this.postsService.getPostModelByIdOrUser(postId, user);

    const newComment = this.commentsRepository.create({
      ...createCommentsDto,
      author: user,
      post,
    });

    return await this.commentsRepository.save(newComment);
  }

  public async updateComment(
    user: UsersModel,
    postId: number,
    commentId: number,
    updateCommentsDto: UpdateCommentsDto,
  ): Promise<CommentsModel> {
    // 강의에서는 preload 전에 findOne으로 존재 여부를 확인했지만
    // preload 자체가 find + merge 역할을 하므로 굳이 중복 호출할 필요는 없음
    const comment = await this.commentsRepository.preload({
      ...updateCommentsDto,
      id: commentId,
      post: { id: postId },
      author: { id: user.id },
    });

    if (!comment) {
      throw new BadRequestException('댓글을 찾을 수 없습니다.');
    }

    return await this.commentsRepository.save(comment);
  }

  public async deleteComment(
    user: UsersModel,
    postId: number,
    commentId: number,
  ): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, post: { id: postId }, author: { id: user.id } },
    });

    if (!comment) {
      throw new BadRequestException('댓글을 찾을 수 없습니다.');
    }

    await this.commentsRepository.delete({
      id: commentId,
      post: { id: postId },
      author: { id: user.id },
    });
  }
}
