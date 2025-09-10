import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exception-filter/http.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // class validator들이 동작할 수 있도록 ValidationPipe를 글로벌로 등록한다.
  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * 요청에서 받은 plain object를 DTO 클래스 인스턴스로 변환(transform)하는 옵션.
       *
       * 이 옵션이 true일 경우
       * => DTO 클래스에 선언된 기본값, getter, 메서드 등이 정상적으로 적용된다.
       *
       * 이 옵션이 false일 경우
       * => 컨트롤러로 전달되는 값은 DTO 타입이지만, 실제로는 plain object이며,
       *    DTO 클래스의 기본값이나 기능(getter, 메서드 등)은 적용되지 않는다.
       */
      transform: true,
      transformOptions: {
        // DTO 프로퍼티에 선언된 class validator 데코레이터에 기반해
        // 자동으로 타입을 변환하는 것을 허용.
        enableImplicitConversion: true,
      },
      // 요청에서 받은 plain object에서 DTO에 정의되지 않은 프로퍼티는 제거한다.
      whitelist: true,
      // DTO에 정의되지 않은 프로퍼티가 요청의 plain object에 포함되어 있을 경우 에러를 발생시킨다.
      forbidNonWhitelisted: true,
    }),
  );

  // 앱 전체에 HttpExceptionFilter를 적용한다.
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
