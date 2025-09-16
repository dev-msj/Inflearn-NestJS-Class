import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

// Catch 데코레이터에 전달된 Exception과 관련된 예외가 발생했을 때 해당 필터가 동작한다.
// 이를 통해 원하는 Exception Type에 마다 별도의 예외처리를 할 수 있다.
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();
    const status = exception.getStatus();

    // 로그 파일을 생성하거나
    // 에러 모니터링 시스템에 API 콜을 전송하는 등의 작업을 수행할 수 있다.

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      path: request.url,
    });
  }
}
