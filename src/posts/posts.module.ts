import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModel } from 'src/entities/posts.entity';

@Module({
  imports: [
    // forFeature() 메서드에 필요한 모델 리스트들을 전달한다.
    // 이를 통해 TypeORM이 해당 모델 리스트들에 대한 Repository를 만들어 준다.
    TypeOrmModule.forFeature([PostModel]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
