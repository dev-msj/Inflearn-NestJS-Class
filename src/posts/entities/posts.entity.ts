import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UsersModel } from 'src/users/entities/users.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { ImageModel } from 'src/common/entities/image.entity';

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

  @OneToMany(() => ImageModel, (image) => image.post, { cascade: true })
  images: ImageModel[];

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
