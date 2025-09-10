import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * 들어오는 트래픽을 모니터링하거나
 * CORS나 Helmet 같은 패키지를 활용해
 * 보안을 강화하는 등의 작업을 수행할 수 있다.
 */
@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `[REQ][Middleware] ${req.method} ${req.url} ${new Date().toLocaleDateString('kr')}`,
    );

    next();
  }
}
