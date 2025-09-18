import { CreateCommentsDto } from './dto/create-comments.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entities/comments.entity';
import {
  DataSource,
  EntityManager,
  EntityNotFoundError,
  Repository,
} from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { UsersModel } from 'src/users/entities/users.entity';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { PostsService } from '../posts.service';
import { PostsModel } from '../entities/posts.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
    private readonly postsService: PostsService,
  ) {}

  public async checkCommentModelExists(
    commentId: number,
    postId: number,
    user: UsersModel,
  ): Promise<boolean> {
    return await this.commentsRepository.existsBy({
      id: commentId,
      author: { id: user.id },
      post: { id: postId },
    });
  }

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
    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const postRepository = entityManager.getRepository(PostsModel);
        const commentsRepository = entityManager.getRepository(CommentsModel);

        const post = await this.postsService.getPostModelByIdOrUser(
          postId,
          user,
          postRepository,
        );

        await this.postsService.incrementCommentCount(postId, postRepository);

        const newComment = commentsRepository.create({
          ...createCommentsDto,
          author: { id: user.id },
          post: { id: post.id },
        });

        return await this.commentsRepository.save(newComment);
      },
    );
  }

  public async updateComment(
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
  ): Promise<boolean> {
    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const postRepository = entityManager.getRepository(PostsModel);
        const commentsRepository = entityManager.getRepository(CommentsModel);

        const comment = await commentsRepository.findOne({
          where: {
            id: commentId,
            post: { id: postId },
            author: { id: user.id },
          },
        });

        if (!comment) {
          throw new BadRequestException('댓글을 찾을 수 없습니다.');
        }

        await commentsRepository.delete({
          id: commentId,
          post: { id: postId },
          author: { id: user.id },
        });

        await this.postsService.decrementCommentCount(postId, postRepository);

        return true;
      },
    );
  }
}
