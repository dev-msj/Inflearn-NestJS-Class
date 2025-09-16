import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModel } from './entities/comments.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { PostsModule } from '../posts.module';
import { UsersModule } from 'src/users/users.module';
import { PostExistsMiddleware } from './middleware/post-exists.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsModel]),
    CommonModule,
    AuthModule,
    PostsModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule implements NestModule {
  // PostExistsMiddleware를 CommentsController에 적용
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddleware).forRoutes(CommentsController);
  }
}
