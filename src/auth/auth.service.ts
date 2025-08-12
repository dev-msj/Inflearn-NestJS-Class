import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * TODO
   *
   * 1. registerWithEmail
   *    - email, nickname, password를 받아서 회원가입을 처리하는 메서드
   *    - 성공 시 accessToken, refreshToken을 발급하여 반환
   *      => 회원가입 후 다시 로그인 해야하는 불필요한 절차를 없애기 위해 토큰을 바로 발급
   *
   * 2. loginWithEmail
   *    - email, password를 받아서 로그인 처리를 하는 메서드
   *    - 성공 시 accessToken, refreshToken을 발급하여 반환
   *
   * 3. loginUser
   *   - 1, 2번에서 필요한 accessToken, refreshToken을 발급하여 반환하는 메서드
   *
   * 4. signToken
   *   - 3에서 필요한 accessToken, refreshToken을 sign하는 메서드
   *
   * 5. authenticateWithEmailAndPassword
   *    - 2번에서 필요한 email, password를 검증하는 메서드
   *      a. 사용자가 존재하는지 확인
   *      b. 비밀번호가 일치하는지 확인
   *      c. a, b가 모두 통과되면 찾은 사용자 정보 반환
   *      d. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
   */

  public async registerWithEmail(
    user: Pick<UsersModel, 'email' | 'nickname' | 'password'>,
  ) {
    // npm 사이트에서 bcrypt 패키지의 "A Note on Rounds" 섹션을 참고하여,
    // rounds 설정에 따른 처리 속도를 확인할 수 있다.
    const hashedPassword = bcrypt.hashSync(user.password, HASH_ROUNDS);
    const createdUser = await this.usersService.createUser({
      nickname: user.nickname,
      email: user.email,
      password: hashedPassword,
    });

    return this.loginUser({
      email: createdUser.email,
      id: createdUser.id,
    });
  }

  public async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const authenticatedUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(authenticatedUser);
  }

  private async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    /**
     *      a. 사용자가 존재하는지 확인
     *      b. 비밀번호가 일치하는지 확인
     *      c. a, b가 모두 통과되면 찾은 사용자 정보 반환
     */

    const existingUser = await this.usersService.getUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    /**
     * 파라미터
     *
     * 1. 입력된 비밀번호
     * 2. 기존 해시 -> 사용자 정보에 저장된 비밀번호 해시
     */
    const passOk = await bcrypt.compare(user.password, existingUser.password);
    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return existingUser;
  }

  private loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  private signToken(
    user: Pick<UsersModel, 'email' | 'id'>,
    isRefreshToken: boolean,
  ) {
    /**
     * Payload에 들어갈 정보
     *
     * 1. email
     * 2. sub -> 사용자의 id
     * 3. type: 'access' | 'refresh'
     */
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    // jwtService를 사용하여 토큰을 생성한다.
    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 60 * 60 : 60 * 5, // seconds 단위로 설정
    });
  }
}
