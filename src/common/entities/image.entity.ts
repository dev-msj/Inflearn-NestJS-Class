import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { POST_PUBLIC_IMAGE_PATH } from '../const/path.const';
import { join } from 'path';
import { PostsModel } from 'src/posts/entities/posts.entity';

export enum ImageModelType {
  POST_IMAGE,
}

@Entity()
export class ImageModel extends BaseModel {
  @Column({ default: 0 })
  @IsInt()
  @IsOptional()
  order?: number;

  @Column({ type: 'enum', enum: ImageModelType })
  @IsEnum(ImageModelType)
  @IsString()
  imageModelType: ImageModelType;

  @Column()
  @IsString()
  // 이미지 파일명에 경로를 합친 값을 path 프로퍼티에 담아준다.
  // 이를 통해 프론트에서는 도메인만 붙여서 간단하게 이미지를 요청할 수 있다.
  @Transform(({ value, obj }) => {
    if (obj.imageModelType === ImageModelType.POST_IMAGE) {
      return `/${join(POST_PUBLIC_IMAGE_PATH, value)}`;
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne(() => PostsModel, (post) => post.images, { nullable: true })
  post?: PostsModel;
}
