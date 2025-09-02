import { CreatePostDto } from './dto/create-post.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { UpdatePostDto } from './dto/update-post.dto';

/**
 * NestJS는 크게 Controller, Provider, Module 3가지 형태로 구성되어 있다.
 * 라우팅에 관련한 내용은 Controller가 담당하며,
 * 그에 대한 비즈니스 로직 처리는 Provider가 담당한다.
 * 이를 통해 각 레이어가 담당하는 책임을 분리하여, 코드의 가독성과 재사용성을 늘릴 수 있다.
 */
@Injectable()
export class PostsService {
  constructor(
    // PostModel을 다루는 Repository를 TypeORM으로부터 주입받는다.
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  public async getAllPostModels(): Promise<PostsModel[]> {
    return await this.postsRepository.find({
      relations: ['author'], // author는 UsersModel의 관계를 참조한다.
    });
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
    createPostDto: CreatePostDto
    // title: string,
    // content: string,
  ): Promise<PostsModel> {
    // 1) create -> 저장할 객체를 생성한다.
    // 2) save -> 객체를 저장한다. (create 메서드에서 생성한 객체로)

    // 서버에서 생성된 PostModel로 id값이 생성되지 않는다.
    const post = this.postsRepository.create({
      author: { id: authorId }, // author는 UsersModel의 id값을 참조한다.
      ...createPostDto,
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
