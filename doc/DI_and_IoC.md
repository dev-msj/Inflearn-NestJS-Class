# NestJS의 DI와 IoC

일반적으로 class의 객체를 생성하기 위해서는 new 키워드를 활용해 객체를 생성하여 힙 메모리의 주소를 스택 메모리에 할당한다. 그러나 NestJS의 코드들을 보면 다음과 같이 특별히 객체를 생성해서 전달하는 곳이 없는데도 불구하고 constructor에 객체를 받는 코드를 작성한다. 어떻게 이런 코드가 동작할 수 있을까?

```typescript
export AppController {
  constructor(
    private readonly userService: UserService,
    private readonly blogService: BlogService,
  ) {}

  @Get()
  public async getUser(): Promise<User> {
    return userService.readUser();
  }

  ...
}
```

## DI와 IoC

개발자가 직접 객체를 전달하지 않고, 프레임워크에 의해 필요한 객체들을 주입받는 것을 DI(Dependency Injection)이라고 한다. 이러한 DI는 NestJS에서 제공하는 관리하는 Container에 의해 NestJS의 Context(module 파일)에 등록된 provider들을 필요한 class들에게 주입하게 되는데, 이처럼 객체의 생명주기가 개발자에 의해 관리되지 않고 프레임워크에 의해 관리되는 것을 IoC(Inversion of Control)이라고 한다.

이렇게 IoC Container에 의해 DI가 발생하기 때문에, 개발자가 특별히 코드를 작성하지 않아도 constructor가 객체를 주입받을 수 있게 되는 것이다.

## 어떤 이점을 얻을 수 있는가?

어떤 class를 구현할 때마다 필요한 객체의 생명주기를 관리하고 주입하는 코드를 개발자가 직접 작성하는 행위를 매번 반복하는 것은 비효율적이며, 높은 결합도로 인해 관리하기가 어렵다. 이처럼 반복되는 패턴을 Framework을 통해 자동화하여, 관리를 위한 코드를 작성하는 부담을 줄이고 기능 구현에만 집중할 수 있게 한다. 결과적으로 개발자는 필요한 객체를 NestJS Context(module 파일)에 등록해주기만 하면 되니, 코드의 복잡성과 결합도가 낮아지고, 코드의 재사용성과 유지보수성이 향상 된다.