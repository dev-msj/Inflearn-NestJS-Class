import { CreatePostDto } from './dto/create-post.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import {
  ENV_HOST_KEY,
  ENV_PROTOCOL_KEY,
} from 'src/common/const/env-keys.const';
import { ConfigService } from '@nestjs/config';

/**
 * NestJS는 크게 Controller, Provider, Module 3가지 형태로 구성되어 있다.
 * 라우팅에 관련한 내용은 Controller가 담당하며,
 * 그에 대한 비즈니스 로직 처리는 Provider가 담당한다.
 * 이를 통해 각 레이어가 담당하는 책임을 분리하여, 코드의 가독성과 재사용성을 늘릴 수 있다.
 */
@Injectable()
export class PostsService {
  constructor(
    private readonly configService: ConfigService,
    // PostModel을 다루는 Repository를 TypeORM으로부터 주입받는다.
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  public async getAllPostModels(): Promise<PostsModel[]> {
    return await this.postsRepository.find({
      relations: ['author'], // author는 UsersModel의 관계를 참조한다.
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
        relations: ['author'],
      },
      'posts',
    );
  }

  private async pagePaginatePosts(paginatePostDto: PaginatePostDto) {
    /**
     * data: Data[]
     * total: number
     * next: optional => 화면상의 페이지 버튼을 통해 결정되기 때문에 사실상 필요없음.
     */

    // findAndCount은 조건에 해당하는 쿼리 데이터와
    // take, skip이 고려되지 않은 실제 총 데이터의 갯수를 반환한다.
    const [posts, total] = await this.postsRepository.findAndCount({
      take: paginatePostDto.take,
      skip: (paginatePostDto.page - 1) * paginatePostDto.take,
      order: {
        createdAt: paginatePostDto.order__createdAt,
      },
    });

    return {
      data: posts,
      total,
    };
  }

  private async cursorPaginatePosts(paginatePostDto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};
    if (paginatePostDto.where__id__less_than) {
      where.id = LessThan(paginatePostDto.where__id__less_than);
    } else if (paginatePostDto.where__id__more_than) {
      where.id = MoreThan(paginatePostDto.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: paginatePostDto.order__createdAt,
      },
      take: paginatePostDto.take,
    });

    // 검색된 post가 존재할 경우 마지막 post를 반환
    /**
     * 이 로직에서는 db의 총 데이터의 갯수가 take의 배수일 경우
     * 마지막 페이지임에도 다음 페이지가 존재한다고 판단하는 문제가 있다.
     * 이를 회피하기 위해 db에서 데이터 조회 시 1개 더 가져오도록 하여
     * 마지막 페이지임을 더욱 명확히 판단할 수 있을 것 같다.
     */
    const lastItem =
      posts.length > 0 && posts.length === paginatePostDto.take
        ? posts[posts.length - 1]
        : null;

    const nextUrl =
      lastItem &&
      new URL(
        `${this.configService.get<string>(ENV_PROTOCOL_KEY)}://${this.configService.get<string>(ENV_HOST_KEY)}/posts`,
      );
    if (nextUrl) {
      /**
       * dto의 키 값들을 루핑하면서
       * 키 값에 해당되는 value가 존재하면
       * param에 그대로 붙여넣는다.
       */
      Object.keys(paginatePostDto).forEach((key) => {
        if (
          paginatePostDto[key] &&
          key !== 'where__id__more_than' &&
          key !== 'where__id__less_than'
        ) {
          nextUrl.searchParams.append(key, paginatePostDto[key]);
        }
      });

      let key = null;
      if (paginatePostDto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    /**
     * Response
     *
     * data: Data[],
     * cursor: {
     *   after: 마지막 데이터의 ID
     * },
     * count: 응답한 데이터의 갯수
     * next: 다음 요청에 사용할 URL
     *
     * 페이지 기반의 페이징 방식은 중간 데이터가 추가/삭제되었을 때
     * 데이터의 중복이나 누락이 발생하여 자연스럽지 못한 사용자 경험을 줄 수 있다.
     * 이러한 일이 발생하더라도 사용자가 자연스러운 탐색 경험을 할 수 있도록
     * 마지막 아이템의 ID를 활용하는 커서 기반의 페이징 방식을 활용한다.
     */
    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  public async generatePosts(userId: number) {
    for (let i = 1; i <= 100; i++) {
      await this.createPostModel(userId, {
        title: `임의의 Post ${i}`,
        content: `임의의 Content for post ${i}`,
      });
    }
  }

  public async getPostModelById(id: number): Promise<PostsModel> {
    // id에 해당하는 PostModel을 찾아 반환한다.
    const post = await this.postsRepository.findOne({
      relations: ['author'], // author는 UsersModel의 관계를 참조한다.
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  public async createPostModel(
    authorId: number,
    createPostDto: CreatePostDto,
    // title: string,
    // content: string,
    image?: string,
  ): Promise<PostsModel> {
    // 1) create -> 저장할 객체를 생성한다.
    // 2) save -> 객체를 저장한다. (create 메서드에서 생성한 객체로)

    // 서버에서 생성된 PostModel로 id값이 생성되지 않는다.
    const post = this.postsRepository.create({
      author: { id: authorId }, // author는 UsersModel의 id값을 참조한다.
      ...createPostDto,
      image,
      likeCount: 0,
      commentCount: 0,
    });

    // DB에 실제로 저장된 결과값을 반환한다. (DB에서 auto-increment된 id값이 생성된다.)
    return await this.postsRepository.save(post);
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
