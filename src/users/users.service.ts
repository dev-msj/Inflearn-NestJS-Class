import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  public async createUser(
    user: Pick<UsersModel, 'email' | 'nickname' | 'password'>,
  ): Promise<UsersModel> {
    // 1. nickname 중복 확인
    const existingUser = await this.usersRepository.existsBy({
      nickname: user.nickname,
    });
    if (existingUser) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    // 2. email 중복 확인
    const existingEmail = await this.usersRepository.existsBy({
      email: user.email,
    });
    if (existingEmail) {
      throw new BadRequestException('이미 가입한 이메일입니다.');
    }

    const newUser = this.usersRepository.create(user);

    return await this.usersRepository.save(newUser);
  }

  public async getAllUsers(): Promise<UsersModel[]> {
    return await this.usersRepository.find();
  }

  public async getUserByEmail(email: string): Promise<UsersModel> {
    /**
     * findOne: 관계 로딩, 정렬, 특정 필드 선택 등 복잡한 쿼리에 사용됨
     *
     * findOneBy: 단순히 where 조건만 필요할 때 사용(간단한 조회용)
     */
    return await this.usersRepository.findOneBy({ email });
  }
}
