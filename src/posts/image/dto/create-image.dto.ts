import { PickType } from '@nestjs/mapped-types';
import { ImageModel } from 'src/common/entities/image.entity';

export class CreateImageDto extends PickType(ImageModel, [
  'path',
  'post',
  'order',
  'imageModelType',
]) {}
