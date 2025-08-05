# JWT

## JWT란?

JWT는 서버가 생성한 인증 정보를 JSON 형태로 담아 Base64로 인코딩한 토큰이며, 클라이언트에 저장되어 인증에 사용되는 방식이다.

## JWT의 특징

* JWT는 마이크로서비스 아키텍처나 수평적 확장이 중요한 서비스에 적합하다.
* JWT는 Header, Payload, Signature로 구성되어 있으며, Base 64로 인코딩 되어 있다.
* JWT는 서버에서 생성되며, 클라이언트에서 저장된다.
* 클라이언트가 JWT를 포함해 요청하면, 서버는 토큰만으로 사용자를 식별할 수 있다.
* JWT는 DB에 저장되지 않고, Signature 값을 이용해서 검증할 수 있다. 그래서 매번 DB를 조회할 필요가 없다.
* 인증 정보가 토큰에 담겨있고(Stateless), 클라이언트에서 토큰을 저장하기 때문에 정보 유출의 위험이 있다.
* DB가 필요없기 때문에 수평적 확장(Horizontal Scaling)이 쉽다.

### Stateless

Stateless는 서버가 사용자의 인증 정보를 저장하지 않는 것을 의미한다.
JWT는 인증 정보를 서버가 아닌 토큰에 저장하므로 Stateless에 해당한다.

## JWT의 문제점

* JWT가 탈취된 경우, 토큰이 만료되기 전까지는 유효한 사용자인 것처럼 행동할 수 있다.
* JWT는 한 번 발급되면 만료 전까지 서버에서 강제로 무효화(로그아웃 등)하기 어렵다.
* 토큰이 만료되기 전까지 권한 변경(예: 계정 정지, 권한 회수 등)이 즉시 반영되지 않는다.

## 개선된 JWT 관리 방법

* Access Token과 Refresh Token을 분리하여 사용한다.
* Access Token과 Refresh Token 모두 서버 저장소(예: DB, Redis)에 저장해 관리한다
* Access Token은 약 10분~1시간 등 짧은 만료 기간을 사용해, 탈취 시 피해를 최소화한다.
* Refresh Token은 2주~30일 등 긴 만료 기간을 사용한다.
* Access Token이 만료되면, 클라이언트는 Refresh Token을 이용해 새로운 Access Token을 발급받는다.
* Refresh Token도 탈취 위험이 있으므로, 서버 저장소에 저장하고, 재발급 시마다 갱신하거나 블랙리스트로 관리한다.

### 개선으로 얻을 수 있는 이점

* Access Token이 탈취되어도 만료 시간이 짧아 장기간 악용이 어렵다.
* 탈퇴한 유저로 요청을 하거나 위변조된 토큰을 사용할 경우, 즉시 토큰을 무효화할 수 있다.

### 개선된 JWT는 Stateless?

개선된 JWT 구조는 기존의 순수 JWT 방식과 달리 Stateful의 성격을 일부 가지게 된다.
왜냐하면 순수한 인증 정보를 서버 저장소에 저장하는 것이 아닌 Access Token과 Refresh Token을 저장하는 구조이기 때문이다.
즉, 개선된 JWT 구조는 "완전한 Stateless"가 아니라, "부분적으로 Stateful"한 구조다.
실무에서는 보안과 관리의 이유로 이처럼 Statefulness를 도입하는 경우가 많다.

## 별도의 인증 서버를 활용한 JWT 인증

* JWT 방식에서도 인증 서버(Authorization Server)를 별도로 두고, 인증 서버가 JWT를 발급하며, 각 서비스(API 서버 등)는 JWT의 Signature만 검증하는 구조가 일반적이다.
* OAuth2, OpenID Connect 등 표준 프로토콜에서도 인증 서버 분리 구조를 사용한다.
