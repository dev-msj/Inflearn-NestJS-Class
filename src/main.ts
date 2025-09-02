import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // class validator들이 동작할 수 있도록 ValidationPipe를 글로벌로 등록한다.
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
