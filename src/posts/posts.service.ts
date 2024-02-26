import { Injectable, NotFoundException } from '@nestjs/common';

export interface PostModel {
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

/**
 * NestJS는 크게 Controller, Provider, Module 3가지 형태로 구성되어 있다.
 * 라우팅에 관련한 내용은 Controller가 담당하며,
 * 그에 대한 비즈니스 로직 처리는 Provider가 담당한다.
 * 이를 통해 각 레이어가 담당하는 책임을 분리하여, 코드의 가독성과 재사용성을 늘릴 수 있다.
 */
@Injectable()
export class PostsService {
  public getAllPostModels(): PostModel[] {
    return mockPostList;
  }

  public getPostModelById(id: number): PostModel {
    const mockPost = mockPostList.find((mockPost) => mockPost.id === id);

    if (!mockPost) {
      throw new NotFoundException();
    }

    return mockPost;
  }

  public createPostModel(
    author: string,
    title: string,
    content: string,
  ): PostModel {
    const postModel: PostModel = {
      id: mockPostList[mockPostList.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    mockPostList = [...mockPostList, postModel];

    return postModel;
  }

  public updatePostModel(
    id: number,
    author: string,
    title: string,
    content: string,
  ): PostModel {
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

  public upsertPostModel(
    id: number,
    author: string,
    title: string,
    content: string,
  ): PostModel {
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

  public deletePostModelById(id: number) {
    const mockPost = mockPostList.find((mockPost) => mockPost.id === id);

    if (!mockPost) {
      throw new NotFoundException();
    }

    mockPostList = mockPostList.filter((mockPost) => mockPost.id !== +id);

    return id;
  }
}
