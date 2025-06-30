import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../const/rules.enum';
import { PostsModel } from 'src/posts/entities/posts.entity';

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  // 길이가 20자 이하이며, 중복되지 않는 닉네임
  @Column({ length: 20, unique: true })
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  rule: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author, { nullable: true })
  posts: PostsModel[];
}
