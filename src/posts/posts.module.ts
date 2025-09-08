import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import * as fs from 'fs';
import { POSTS_IMAGE_PATH } from 'src/common/const/path.const';
import { v4 as uuid } from 'uuid';

@Module({
  imports: [
    // 파일 업로드 및 제한 사항 설정
    MulterModule.register({
      limits: {
        // 바이트 단위로 입력
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb(callback)
         * - 첫 번째 인자: 에러가 있을 경우 에러 정보 전달
         * - 두 번째 인자: 파일을 받을지 말지 boolean 값 전달
         */

        const ext = extname(file.originalname); // 확장자 추출

        // 파일 타입 필터링
        if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext.toLowerCase())) {
          return cb(
            new BadRequestException(
              'jpg, jpeg, png, gif 파일만 업로드 가능합니다.',
            ),
            false, // 에러 상황이므로 파일을 받지 않도록 false 전달
          );
        }

        cb(null, true);
      },
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          // 경로가 존재하지 않을 경우, 경로를 생성.
          if (!fs.existsSync(POSTS_IMAGE_PATH)) {
            fs.mkdirSync(POSTS_IMAGE_PATH, { recursive: true });
          }
          cb(null, POSTS_IMAGE_PATH); // POSTS_IMAGE_PATH에 파일 저장
        },
        filename: (req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`); // 파일 이름을 UUID로 설정
        },
      }),
    }),
    // forFeature() 메서드에 필요한 모델 리스트들을 전달한다.
    // 이를 통해 TypeORM이 해당 모델 리스트들에 대한 Repository를 만들어 준다.
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule,
    CommonModule,
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
