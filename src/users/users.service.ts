import { Injectable } from '@nestjs/common';
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
    nickname: string,
    email: string,
    password: string,
  ): Promise<UsersModel> {
    const user = this.usersRepository.create({
      nickname,
      email,
      password,
    });

    return await this.usersRepository.save(user);
  }

  public async getAllUsers(): Promise<UsersModel[]> {
    return await this.usersRepository.find();
  }
}
