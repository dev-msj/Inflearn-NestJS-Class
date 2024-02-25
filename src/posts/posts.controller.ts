import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let mockPostList: PostModel[] = [
  {
    id: 1,
    author: 'newjeans_official',
    title: '뉴진스 해린',
    content: '메이크업 고치고 있는 해린',
    likeCount: 10000000,
    commentCount: 9999999,
  },
  {
    id: 2,
    author: 'newjeans_official',
    title: '뉴진스 하니',
    content: '노래 연습 중인 하니',
    likeCount: 10000000,
    commentCount: 9999999,
  },
  {
    id: 3,
    author: 'newjeans_official',
    title: '뉴진스 민지',
    content: '춤 연습 중인 민지',
    likeCount: 10000000,
    commentCount: 9999999,
  },
];

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
  public getPosts(): PostModel[] {
    return mockPostList;
  }

  /**
   * [GET] http://localhost:3000/{store}/{resource}
   * - Query 사용
   * - store에서 요청된 resource를 가져온다.
   * - resource는 단수형 명사로 작성한다.
   */
  @Get(':id')
  public getPostById(@Param('id') id: string): PostModel {
    const mockPost = mockPostList.find((mockPost) => mockPost.id === +id);

    if (!mockPost) {
      throw new NotFoundException();
    }

    return mockPost;
  }

  /**
   * [Post] http://localhost:3000/{store}
   * - Body 사용
   * - store에 새로운 resource를 생성한다.
   */
  @Post()
  public postPost(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const post: PostModel = {
      id: mockPostList[mockPostList.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    mockPostList = [...mockPostList, post];

    return post;
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
  ) {
    const mockPost = mockPostList.find((mockPost) => mockPost.id === +id);

    if (!mockPost) {
      throw new NotFoundException();
    }

    if (author) {
      mockPost.author = author;
    }

    if (title) {
      mockPost.title = title;
    }

    if (content) {
      mockPost.content = content;
    }

    return mockPost;
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
  ) {
    const mockPost = mockPostList.find((mockPost) => mockPost.id === +id);

    if (!mockPost) {
      const post: PostModel = {
        id: mockPostList[mockPostList.length - 1].id + 1,
        author,
        title,
        content,
        likeCount: 0,
        commentCount: 0,
      };

      mockPostList = [...mockPostList, post];

      return post;
    }

    mockPost.author = author;
    mockPost.title = title;
    mockPost.content = content;

    return mockPost;
  }

  /**
   * [Delete] http://localhost:3000/{store}/{resource}
   * - Body 사용
   * - store에서 요청된 resource를 삭제한다.
   */
  @Delete(':id')
  public deletePost(@Param('id') id: string) {
    const mockPost = mockPostList.find((mockPost) => mockPost.id === +id);

    if (!mockPost) {
      throw new NotFoundException();
    }

    mockPostList = mockPostList.filter((mockPost) => mockPost.id !== +id);

    return id;
  }
}
