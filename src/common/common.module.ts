import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { extname } from 'path';
import { POSTS_IMAGE_PATH, TEMP_IMAGE_PATH } from './const/path.const';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
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
          if (!fs.existsSync(TEMP_IMAGE_PATH)) {
            fs.mkdirSync(TEMP_IMAGE_PATH, { recursive: true });
          }
          cb(null, TEMP_IMAGE_PATH); // TEMP_IMAGE_PATH에 파일 저장

          // 경로가 존재하지 않을 경우, 경로를 생성.
          // if (!fs.existsSync(POSTS_IMAGE_PATH)) {
          //   fs.mkdirSync(POSTS_IMAGE_PATH, { recursive: true });
          // }
          // cb(null, POSTS_IMAGE_PATH); // POSTS_IMAGE_PATH에 파일 저장
        },
        filename: (req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`); // 파일 이름을 UUID로 설정
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
