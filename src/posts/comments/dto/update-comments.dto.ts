import { IsInt, IsOptional } from 'class-validator';
import { CreateCommentsDto } from './create-comments.dto';

export class UpdateCommentsDto extends CreateCommentsDto {
  @IsInt()
  @IsOptional()
  likeCount?: number;
}
