import { FindManyOptions } from 'typeorm';
import { PostsModel } from '../entities/posts.entity';

// PostsModel을 조회할 때 기본으로 사용할 옵션을 정의하여 재사용성을 높인다.
export const DEFAULT_POST_FIND_OPTIONS: FindManyOptions<PostsModel> = {
  // relations: ['author', 'images'],
  relations: {
    author: true,
    images: true,
  },
};
