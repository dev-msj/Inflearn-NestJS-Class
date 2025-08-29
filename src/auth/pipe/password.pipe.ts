import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

/**
 * transform의 역할(권장)
 * - 입력값을 검증하거나(길이/포맷) 필요한 변환을 수행
 * - 검증 실패 시 BadRequestException 등을 던져 잘못된 입력을 차단
 */
@Injectable()
export class PasswordPipe implements PipeTransform {
  /**
   * value: 실제로 클라이언트에서 전송한 password 값
   *
   * metadata: value에 대한 부가적인 정보
   * - type: 값이 어디서 왔는지 (예: 'body', 'query', 'param', 또는 커스텀 데코레이터)
   * - metatype: 라우트 핸들러에서 기대하는 타입(런타임 기준). 예: String, Number, 또는 DTO 클래스
   * - data: 데코레이터에 설정한 추가 데이터. 예: @Body('password') 에서 'password'
   */
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.length > 8) {
      throw new BadRequestException('비밀번호는 8자 이하로 입력해주세요.');
    }

    return value.toString();
  }
}
