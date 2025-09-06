import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseModel } from './entities/base.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.const';

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  public async paginate<T extends BaseModel>(
    basePaginationDto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (basePaginationDto.page) {
      return await this.pagePaginate(
        basePaginationDto,
        repository,
        overrideFindOptions,
      );
    } else {
      return await this.cursorPaginate(
        basePaginationDto,
        repository,
        overrideFindOptions,
        path,
      );
    }
  }

  private async pagePaginate<T extends BaseModel>(
    basePaginationDto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(basePaginationDto);

    // overrideFindOptions이 후에 전달되므로 findOptions과 중복되는 부분이 있다면
    // 후에 전달된 값으로 덮어씌워진다.
    const [data, total] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    basePaginationDto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const findOptions = this.composeFindOptions<T>(basePaginationDto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === basePaginationDto.take
        ? results[results.length - 1]
        : null;

    const nextUrl =
      lastItem &&
      new URL(
        `${this.configService.get<string>(ENV_PROTOCOL_KEY)}://${this.configService.get<string>(ENV_HOST_KEY)}/${path}`,
      );
    if (nextUrl) {
      /**
       * dto의 키 값들을 루핑하면서
       * 키 값에 해당되는 value가 존재하면
       * param에 그대로 붙여넣는다.
       */
      Object.keys(basePaginationDto).forEach((key) => {
        if (
          basePaginationDto[key] &&
          key !== 'where__id__more_than' &&
          key !== 'where__id__less_than'
        ) {
          nextUrl.searchParams.append(key, basePaginationDto[key]);
        }
      });

      let key = null;
      if (basePaginationDto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    basePaginationDto: BasePaginationDto,
  ): FindManyOptions<T> {
    /**
     * where,
     * order,
     * take,
     * skip -> page 기반일 때만
     */
    /**
     * DTO의 현재 생긴 구조는 아래와 같다
     *
     * {
     *   where__id__more_than: 1,
     *   order__createdAt: 'ASC'
     * }
     *
     * 현재는 where__id__more_than/where__id__less_than에 해당되는 where 필터만 사용 중이지만
     * 나중에는 where__like__more_than 또는 where__title__ilike 등 추가 필터를 넣고 싶어졌을 때
     * 모든 where 필터들을 자동으로 파싱할 수 있을만한 기능을 제작해야 한다.
     *
     * 1. where로 시작한다면 필터 로직을 적용한다.
     * 2. order로 시작한다면 정렬 로직을 적용한다.
     * 3. 필터 로직을 적용한다면 '__' 기준으로 split 했을 때, 3개의 값으로 나눠지는지
     *    2개의 값으로 나눠지는지 확인한다.
     *    3-1. 3개의 값으로 나뉜다면 FILTER_MAPPER에서 해당되는 operator 함수를 찾아서 적용한다.
     *         ['where', 'id', 'more_than']
     *    3-2. 2개의 값으로 나뉜다면 정확한 값을 필터하는 것이기 때문에 operator 없이 적용한다.
     *         where__id => ['where', 'id']
     * 4. order의 경우 3-2처럼 적용한다.
     */
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(basePaginationDto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter<T>(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseOrderFilter<T>(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: basePaginationDto.take,
      skip: basePaginationDto.page
        ? (basePaginationDto.page - 1) * basePaginationDto.take
        : null,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> {
    const options: FindOptionsWhere<T> = {};

    /**
     * 예를 들어 where__id__more_than을 '__'을 기준으로 split 했을 때
     * ['where', 'id', 'more_than']으로 나뉜다.
     */
    const split = this.splitKey(key);

    /**
     * 'where__id = 3'와 같이 길이가 2인 경우에는
     * FindOptionsWhere로 풀어보면 아래와 같다.
     *
     * {
     *   where: {
     *     id: 3
     *   }
     * }
     */
    if (split.length === 2) {
      this.addFieldAndValue<T, FindOptionsWhere<T>>(
        options,
        this.splitKey(key)[1], // ['where', 'id']
        value,
      );
    } else {
      /**
       * 길이가 3일 경우에는 Typeorm 유틸리티 적용이 필요한 경우다.
       *
       * where__id__more_than의 경우
       * where는 버려도 되고,
       * 두번째 값은 필터할 field 값이 되고,
       * 세번째 값은 operator로 typeorm 유틸리티가 된다.
       *
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * field 값에 FILTER_MAPPER에서 해당되는 유틸리티를 가져온 후
       * 값에 적용해준다.
       */
      const [_, field, operator] = split;

      // 만약 split 대상 문자가 존재하지 않으면 길이가 무조건 1이다.
      const values = value.toString().split(',');

      // 사용할 typeorm 유틸리티에 필요한 파라미터에 맞게 적절하게 구현해주면 된다.
      if (operator === 'between') {
        this.addFieldAndValue<T, FindOptionsWhere<T>>(
          options,
          field,
          FILTER_MAPPER[operator](values[0], values[1]),
        );
      } else if (operator === 'i_like') {
        this.addFieldAndValue<T, FindOptionsWhere<T>>(
          options,
          field,
          FILTER_MAPPER[operator](`%${value}%`),
        );
      } else {
        /**
         * field -> id
         * operator -> more_than
         * FILTER_MAPPER[operator] -> MoreThan
         */
        // 전달할 파라미터가 1개이므로 split 없이 value를 그대로 전달한다.
        this.addFieldAndValue<T, FindOptionsWhere<T>>(
          options,
          field,
          FILTER_MAPPER[operator](value),
        );
      }
    }

    return options;
  }

  private parseOrderFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsOrder<T> {
    const options: FindOptionsOrder<T> = {};

    /**
     * order는 무조건 2개로 split 된다.
     */
    return this.addFieldAndValue<T, FindOptionsOrder<T>>(
      options,
      this.splitKey(key)[1],
      value,
    );
  }

  private splitKey(key: string): string[] {
    const split = key.split('__');
    if (split.length !== 2 && split.length !== 3) {
      const additionalInfo = split[0] === 'where' ? ' 또는 3' : '';
      throw new BadRequestException(
        `${split[0]} 필터는 '__'으로 split 했을 때, 길이가 2${additionalInfo}이어야 합니다. - ${key}`,
      );
    }

    return split;
  }

  private addFieldAndValue<
    T,
    O extends FindOptionsWhere<T> | FindOptionsOrder<T>,
  >(options: O, field: string, value: any): O {
    options[field] = value;

    return options;
  }
}
