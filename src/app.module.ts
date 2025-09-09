import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PostsModel } from './posts/entities/posts.entity';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ENV_DB_HOST_KEY,
  ENV_DB_NAME_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './common/const/env-keys.const';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { ImageModel } from './common/entities/image.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true, // ConfigModule을 애플리케이션 전체에서 사용할 수 있도록 설정
    }),
    // forRoot() 메서드를 사용하여 TypeORM 연결하기 위한 설정을 추가한다.
    /**
     * 비동기 설정을 위해 forRootAsync() 메서드를 사용한다.
     * 동적 환경 변수, 외부 서비스, 조건부 설정 등 런타임에서
     * 필요한 의존성(예: ConfigService)을 주입(inject)받아 설정에 활용할 수 있다.
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(ENV_DB_HOST_KEY),
        port: parseInt(configService.get<string>(ENV_DB_PORT_KEY)),
        username: configService.get<string>(ENV_DB_USERNAME_KEY),
        password: configService.get<string>(ENV_DB_PASSWORD_KEY),
        database: configService.get<string>(ENV_DB_NAME_KEY),
        entities: [PostsModel, UsersModel, ImageModel],
        synchronize: true,
      }),
    }),
    ServeStaticModule.forRoot({
      /**
       * rootPath만 설정할 경우, root 폴더명은 '/'가 된다.
       * 그래서 파일 요청 시에 "http://localhost:3000/posts/파일명"으로 접근해야 한다.
       *
       * 하지만 이렇게만 설정하면 기존의 'posts'로 사용 중인 API 경로와 충돌이 발생한다.
       * 따라서 serveRoot 옵션을 추가하여 정적 파일의 root 폴더명을 변경해준다.
       * "http://localhost:3000/public/post/파일명"으로 접근할 수 있도록 한다.
       */
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    UsersModule,
    PostsModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // ClassSerializerInterceptor를 전역으로 적용
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
