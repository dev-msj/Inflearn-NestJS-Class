import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from 'src/users/entities/users.entity';
import { BaseModel } from 'src/common/entities/base.entity';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, { nullable: false })
  author: UsersModel;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
