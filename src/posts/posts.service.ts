import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';
import { CreatePostDto } from './dto/create-post.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import { ImageModel, ImageModelType } from 'src/common/entities/image.entity';
import { ImageService } from './image/image.service';

/**
 * NestJS는 크게 Controller, Provider, Module 3가지 형태로 구성되어 있다.
 * 라우팅에 관련한 내용은 Controller가 담당하며,
 * 그에 대한 비즈니스 로직 처리는 Provider가 담당한다.
 * 이를 통해 각 레이어가 담당하는 책임을 분리하여, 코드의 가독성과 재사용성을 늘릴 수 있다.
 */
@Injectable()
export class PostsService {
  constructor(
    private readonly dataSource: DataSource,
    // PostModel을 다루는 Repository를 TypeORM으로부터 주입받는다.
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly imageService: ImageService,
    private readonly commonService: CommonService,
  ) {}

  public async getAllPostModels(): Promise<PostsModel[]> {
    return await this.postsRepository.find({
      ...DEFAULT_POST_FIND_OPTIONS,
    });
  }

  public async paginatePosts(paginatePostDto: PaginatePostDto) {
    // if (paginatePostDto.page) {
    //   return await this.pagePaginatePosts(paginatePostDto);
    // } else {
    //   return await this.cursorPaginatePosts(paginatePostDto);
    // }
    return await this.commonService.paginate<PostsModel>(
      paginatePostDto,
      this.postsRepository,
      {
        ...DEFAULT_POST_FIND_OPTIONS,
      },
      'posts',
    );
  }

  public async generatePosts(userId: number) {
    for (let i = 1; i <= 100; i++) {
      await this.createPostModel(userId, {
        title: `임의의 Post ${i}`,
        content: `임의의 Content for post ${i}`,
        images: [],
      });
    }
  }

  public async getPostModelById(id: number): Promise<PostsModel> {
    // id에 해당하는 PostModel을 찾아 반환한다.
    const post = await this.postsRepository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  // TypeORM 0.3 이상부터는 datasource의 transaction()을 통해 트랜잭션을 처리한다.
  public async createPostModel(
    authorId: number,
    createPostDto: CreatePostDto,
  ): Promise<PostsModel> {
    // entityManager는 트랜잭션이 성공했을 때에만 커밋된다.
    const newPostId = await this.dataSource.transaction(
      async (entityManager) => {
        // 트랜잭션의 컨텍스트에서 사용할 Repository를 가져온다.
        const postsRepository = entityManager.getRepository(PostsModel);
        const imageRepository = entityManager.getRepository(ImageModel);

        // 서버에서 생성된 PostModel로 id값이 생성되지 않는다.
        const post = postsRepository.create({
          author: { id: authorId }, // author는 UsersModel의 id값을 참조한다.
          ...createPostDto,
          images: [],
          likeCount: 0,
          commentCount: 0,
        });

        // DB에 실제로 저장된 결과값을 반환한다. (DB에서 auto-increment된 id값이 생성된다.)
        const newPost = await postsRepository.save(post);

        for (let i = 0; i < createPostDto.images.length; i++) {
          await this.imageService.createPostImage(
            {
              post: newPost,
              order: i,
              path: createPostDto.images[i],
              imageModelType: ImageModelType.POST_IMAGE,
            },
            imageRepository,
          );
        }

        return newPost.id;
      },
    );

    return this.getPostModelById(newPostId);
  }

  public async updatePostModel(
    id: number,
    updatePostDto: UpdatePostDto,
  ): Promise<void> {
    const { title, content } = updatePostDto;

    const post = await this.getPostModelById(id);

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    // id에 해당하는 PostModel을 업데이트한다.
    await this.postsRepository.update(id, post);
  }

  public async upsertPostModel(
    id: number,
    updatePostDto: UpdatePostDto,
  ): Promise<PostsModel> {
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면 (id 기준으로) 새로 생성한다.
    // 2) 만약에 데이터가 존재한다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트 한다.

    const post = await this.getPostModelById(id);

    post.title = updatePostDto.title;
    post.content = updatePostDto.content;

    // id에 해당하는 PostModel을 업데이트한다.
    return await this.postsRepository.save(post);
  }

  public async deletePostModelById(id: number): Promise<number> {
    const post = await this.getPostModelById(id);

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(post.id);

    return post.id;
  }
}
