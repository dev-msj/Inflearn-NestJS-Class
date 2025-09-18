import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';
import { UserFollowersModel } from './entities/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
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

  public async followUser(followerId: number, followeeId: number) {
    await this.userFollowersRepository.save({
      follower: { id: followerId },
      followee: { id: followeeId },
    });

    return true;
  }

  public async getFollowers(userId: number, includeNotConfirmed: boolean) {
    const where = {
      followee: { id: userId },
    };

    if (!includeNotConfirmed) {
      where['isConfirmed'] = true;
    }

    const result = await this.userFollowersRepository.find({
      where,
      relations: { followee: true, follower: true },
    });

    return result.map((uf) => ({
      id: uf.follower.id,
      email: uf.follower.email,
      nickname: uf.follower.nickname,
      isConfirmed: uf.isConfirmed,
    }));
  }

  public async confirmFollow(followerId: number, followeeId: number) {
    const followRelation = await this.userFollowersRepository.findOne({
      where: {
        follower: { id: followerId },
        followee: { id: followeeId },
      },
      relations: { follower: true, followee: true },
    });

    if (!followRelation) {
      throw new BadRequestException('존재하지 않는 팔로우 요청입니다.');
    }

    await this.userFollowersRepository.save({
      ...followRelation,
      isConfirmed: true,
    });

    return true;
  }

  public async deleteFollow(followerId: number, followeeId: number) {
    await this.userFollowersRepository.delete({
      follower: { id: followerId },
      followee: { id: followeeId },
    });

    return true;
  }
}
