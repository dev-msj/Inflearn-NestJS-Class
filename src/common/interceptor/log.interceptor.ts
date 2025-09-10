import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    /**
     * 요청이 들어올 때 Request가 들어온 timestamp를 기록한다.
     * [REQ] {request path} {timestamp}
     *
     * 요청이 끝난 후, 응답이 나가는 시점에 다시 timestamp를 기록한다.
     * [RES] {request path} {timestamp} {response time (ms)}
     */
    const request = context.switchToHttp().getRequest();
    const path = request.originalUrl;
    const now = new Date();

    // [REQ] {request path} {timestamp}
    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    /**
     * next.handle()을 실행하는 순간
     * 라우트의 로직이 실행되고 응답이 반환될 때를
     * 핸들링하는 것을 의미한다.
     * 이 때 라우트가 응답하는 값은 observable 형태이고,
     * 핸들러가 이 observable을 받아서 pipe()에 전달한다.
     * pipe()에는 tap()이나 map()과 같은 메서드를 선언된 순서대로 실행한다.
     * 실행되는 메서드들은 pipe()로부터 observable을 전달받는다.
     *
     * pipe()에서 사용할 수 있는 대표적인 rxjs 메서드는 다음과 같다.
     * - tap()은 observable의 값의 변경 없이 모니터링을 위해 사용한다.
     * - map()은 observable의 값을 변형할 때 사용한다.
     */
    return next.handle().pipe(
      // tap((observable) => console.log(observable)),
      // map((observable) => {
      //   return {
      //     message: '응답이 변경되었습니다.',
      //     response: observable,
      //   };
      // }),
      tap((observable) => {
        const afterNow = new Date();
        const interval = afterNow.getMilliseconds() - now.getMilliseconds();

        // [RES] {request path} {timestamp} {response time (ms)}
        console.log(
          `[RES] ${path} ${afterNow.toLocaleString('kr')} ${interval}ms`,
        );
      }),
    );
  }
}
