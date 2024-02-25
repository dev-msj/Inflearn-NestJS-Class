# NestJS를 왜 사용해야 하는가?

## 각 엔진별 Route Handler 코드를 확인해보자.

### NodeJS

``` javascript
const http = require('http');
const url = require('url');

const host = 'localhost';
const port = 3000;

http.createServer((req, res) => {
  if (path === '/') {
    res.writeHead(200, { 'Content-type', 'text/html' });
    res.end('<h1>Home Page!<h1>');
   } else if (path === '/posts') {
    res.writeHead(200, { 'Content-type', 'text/html' });
    res.end('<h1>Post Page!<h1>');
   } else if (path === '/users') {
    res.writeHead(200, { 'Content-type', 'text/html' });
    res.end('<h1>User Page!<h1>');
   } else {
    res.writeHead(404, { 'Content-type', 'text/html' });
    res.end('<h1>404 Page Not Found!<h1>');
   }
});

server.listen(port, host, () => {
  console.log('server running on http://localhost:3000');
});
```

### Express

```javascript
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Home Page!</h1>');
});

app.get('/posts', (req, res) => {
  res.send('<h1>Post Page!</h1>');
});

app.get('/users', (req, res) => {
  res.send('<h1>User Page!</h1>');
});

app.use((req, res) => {
  res.status(404).send('<h1>404 Page Not Found!</h1>');
});

app.listen(port, host, () => {
  console.log('server running on http://localhost:3000');
});
```

### NestJS

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  public getHome(): string {
    return 'Home Page!';
  }

  @Get('posts')
  public getPost(): string {
    return 'Post Page!';
  }

  @Get('users')
  public getUser(): string {
    return 'User Page!';
  }
}
```

## 각 엔진별 코드의 차이점은 무엇인가?

* NodeJS: V8 엔진으로 엔진으로 빌드된 JS 런타임 환경이다. 순수하게 NodeJS만을 활용해 route handler를 구현해 보면, 위에 작성된 코드와 같이 `if`문으로 path마다 분기 처리하여 관련 요청을 수행하는 코드를 작성하게 된다. 하지만 이러한 코드는 가독성이나 확장성 등이 매우 떨어진다.

* Express: NodeJS를 기반으로 웹 서버를 쉽게 작성할 수 있도록 하는 경량화된 프레임워크다. 이를 활용하면 훨씬 더 수월하게 route handler를 구현할 수 있다. <br>하지만 아키텍쳐 구성과 모든 기능들을 직접 구현해야 하며, 관련 패지키들을 직접 다 찾아서 설치해줘야 한다는 문제가 있다.

* NestJS: Controller를 기반으로 route handler를 구현한다. `호출된 route handler가 요청을 수행하고 결과값을 반환`하는 형식을 사용하므로 콜백 형태를 사용하는 Express보다 더 친국하게 느껴진다. 또한 프레임워크에서 웹 서버 구현에 필요한 기본적인 패키지들과 `controller/provider/module`을 활용한 아키텍쳐를 제공한다. 이를 통해 쉽게 테스트하고, 쉽게 확장이 가능하고, 각 모듈 간의 의존성이 분리된 웹 서버를 만들 수 있도록 도와준다.

## 정리

Express를 활용하게 되면 컨트롤러를 어디에 둘지, 서비스를 어디에 둘지, 미들웨어를 어떤 식으로 작성할지 등을 개발자가 고민하며 구현해야 한다. 그리고 결국에는 Express로 잘 짜여진 아키텍쳐로 구성된 웹 서버를 만든다면, 그게 바로 NestJS가 된다.