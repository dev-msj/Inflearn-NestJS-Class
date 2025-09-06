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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true, // ConfigModule을 애플리케이션 전체에서 사용할 수 있도록 설정
    }),
    PostsModule,
    // forRoot() 메서드를 사용하여 TypeORM 연결하기 위한 설정을 추가한다.
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
        entities: [PostsModel, UsersModel],
        synchronize: true,
      }),
    }),
    UsersModule,
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
