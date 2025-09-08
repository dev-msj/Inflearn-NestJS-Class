import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from 'src/users/entities/users.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, { nullable: false })
  author: UsersModel;

  @Column()
  @IsString({
    // message: 'title은 string 타입을 입력해줘야 합니다.',
    message: stringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    // message: 'content은 string 타입을 입력해줘야 합니다.',
    message: stringValidationMessage,
  })
  content: string;

  @Column({ nullable: true })
  image?: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
