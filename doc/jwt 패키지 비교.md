# JWT 패키지 비교

## jsonwebtoken

> 저수준 라이브러리로 JWT의 생성, 검증, 디코드 로직을 직접 구현해야 한다.

* 장점: 가볍고 프레임워크에 의존하지 않으므로 Node 환경이면 어디서나 사용할 수 있다.
* 단점: NestJS가 가진 강점을 활용할 수 없음. 검증/오류 처리를 직접 구현해야 한다.
* 참고: 기본 알고리즘은 HS256(대칭키)이나 RS/ES 계열(비대칭키)도 지원한다.
* 예외: TokenExpiredError, JsonWebTokenError 등 구체적 예외가 발생한다.
* 사용 예시

```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: 1, email: 'a@b' }, process.env.JWT_SECRET, { expiresIn: '1h' });

// 동기/콜백 방식 가능 (프로미스는 기본 제공되지 않음)
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
} catch (err) {
  // TokenExpiredError, JsonWebTokenError 등 처리
}

// decode는 서명 검증을 하지 않음
const decoded = jwt.decode(token);
```

<br><br>

## @nestjs/jwt

> jsonwebtoken을 Wrapping하여 JwtService로 제공하는 Nest용 모듈.

* 장점
  * NestJS의 DI/Config 모듈과 통합하여 설정 주입, 테스트/모킹이 쉽다.
  * Passport 및 전역 가드/예외 필터와 연계해 검증/오류 처리를 중앙화할 수 있다.
* 단점: NestJS에 의존성을 가진다.
* 사용 예시

```typescript
import { JwtModule } from '@nestjs/jwt';

// 모듈에서 Jwt 등록(실사용 시에는 Config 모듈과 registerAsync 사용 권장)
// algorithm/secret/privateKey 등 옵션 전달 가능
JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' }});

// 서비스에서 활용
constructor(private readonly jwtService: JwtService) {}

// 비동기/동기 사용 가능
const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });
const tokenSync = this.jwtService.sign({ sub: user.id, email: user.email });

try {
  const payload = await this.jwtService.verifyAsync(token);
} catch (err) {
  // 토큰 만료/서명 불일치 처리
}
```
