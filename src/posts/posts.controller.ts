import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';

/**
 * author: string;
 * title: string;
 * content: string;
 * likeCount: number;
 * commentCount: number;
 */
interface Post {
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  public getPost(): Post {
    return {
      author: 'newjeans_official',
      title: '뉴진스 해린',
      content: '메이크업 고치고 있는 해린',
      likeCount: 10000000,
      commentCount: 9999999,
    };
  }
}
