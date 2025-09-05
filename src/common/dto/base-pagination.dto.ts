import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  // 이전 데이터의 마지막 ID
  // 이 프로퍼티에 입력된 ID보다 더 작은 ID를 가져오기
  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  // 이전 데이터의 마지막 ID
  // 이 프로퍼티에 입력된 ID보다 더 큰 ID를 가져오기
  // @Type(() => Number) // type을 Number로 변환 => main의 ValidationPipe에서 설정한 enableImplicitConversion으로 대체
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  // 정렬 기준
  // createdAt을 기준으로 오름차/내림차 순으로 정렬
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'ASC';

  // 몇 개의 데이터를 가져올지
  @IsNumber()
  take: number = 20;
}
