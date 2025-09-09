import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { ImageModel } from 'src/common/entities/image.entity';
import { ImageService } from './image/image.service';

@Module({
  imports: [
    // forFeature() 메서드에 필요한 모델 리스트들을 전달한다.
    // 이를 통해 TypeORM이 해당 모델 리스트들에 대한 Repository를 만들어 준다.
    TypeOrmModule.forFeature([PostsModel, ImageModel]),
    AuthModule,
    CommonModule,
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, ImageService],
})
export class PostsModule {}
