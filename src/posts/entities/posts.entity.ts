import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from 'src/users/entities/users.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { Transform } from 'class-transformer';
import { join } from 'path';
import { POST_PUBLIC_IMAGE_PATH } from 'src/common/const/path.const';

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
  // 이미지 파일명에 경로를 합친 값을 image 프로퍼티에 담아준다.
  // 이를 통해 프론트에서는 도메인만 붙여서 간단하게 이미지를 요청할 수 있다.
  @Transform(({ value }) => value && `/${join(POST_PUBLIC_IMAGE_PATH, value)}`)
  image?: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
