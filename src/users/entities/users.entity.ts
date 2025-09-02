import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/rules.enum';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';

@Entity()
export class UsersModel extends BaseModel {
  // 길이가 20자 이하이며, 중복되지 않는 닉네임
  @Column({ length: 20, unique: true })
  @IsString({ message: stringValidationMessage })
  @Length(1, 20, {
    // message: '닉네임은 1~20자 사이로 입력해주세요.',
    message: lengthValidationMessage,
  })
  nickname: string;

  @Column({ unique: true })
  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  email: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(3, 8, { message: lengthValidationMessage })
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
