import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/rules.enum';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { Exclude, Expose } from 'class-transformer';
import { ChatsModel } from 'src/chats/entities/chats.entity';
import { MessagesModel } from 'src/chats/messages/entities/messages.entity';
import { CommentsModel } from 'src/posts/comments/entities/comments.entity';

@Entity()
// @Exclude() // 클래스의 모든 프로퍼티를 응답에서 제외하도록 설정
export class UsersModel extends BaseModel {
  // 길이가 20자 이하이며, 중복되지 않는 닉네임
  @Column({ length: 20, unique: true })
  @IsString({ message: stringValidationMessage })
  @Length(1, 20, {
    // message: '닉네임은 1~20자 사이로 입력해주세요.',
    message: lengthValidationMessage,
  })
  // @Expose() // 클래스의 Exclude로 인해 기본적으로 제외된 프로퍼티에서 선택적으로 응답에 포함되도록 설정
  nickname: string;

  @Column({ unique: true })
  @IsString({ message: stringValidationMessage })
  @IsEmail({}, { message: emailValidationMessage })
  // @Expose() // 클래스의 Exclude로 인해 기본적으로 제외된 프로퍼티에서 선택적으로 응답에 포함되도록 설정
  email: string;

  // Expose를 통해 nickname과 email을 조합한 값이 응답에 포함될 수 있도록 할 수 있다.
  // @Expose()
  // get nicknameAndEmail(): string {
  //   return this.nickname + this.email;
  // }

  @Column()
  @IsString({ message: stringValidationMessage })
  @Length(3, 8, { message: lengthValidationMessage })
  /**
   * * request
   *   - frontend -> backend 전송
   *   - plain object(JSON) -> class instance(DTO)
   *
   * * response
   *   - backend -> frontend 전송
   *   - class instance(DTO) -> plain object(JSON)
   *
   * * ExcludeOptions
   *   - toClassOnly -> class instance로 변환할 때만(request)
   *   - toPlainOnly -> plain object로 변환할 때만(response)
   */
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  rule: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author, { nullable: true })
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel[];

  @OneToMany(() => CommentsModel, (comment) => comment.author)
  comments: CommentsModel[];
}
