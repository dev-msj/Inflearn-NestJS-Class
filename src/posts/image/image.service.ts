import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { promises } from 'fs';
import { join } from 'path';
import { TEMP_IMAGE_PATH, POSTS_IMAGE_PATH } from 'src/common/const/path.const';
import { ImageModel } from 'src/common/entities/image.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  public async createPostImage(
    createImageDto: CreateImageDto,
    imageRepository: Repository<ImageModel> = this.imageRepository,
  ): Promise<ImageModel> {
    // image 이름을 기반으로 파일의 경로를 생성한다
    const tempImagePath = join(
      TEMP_IMAGE_PATH,
      createImageDto.path, // TEMP_IMAGE_PATH에 저장된 파일 이름
    );

    try {
      await promises.access(tempImagePath); // 파일이 존재하는지 확인
    } catch (e) {
      throw new BadRequestException('존재하지 않는 파일입니다.');
    }

    const postImagePath = join(
      POSTS_IMAGE_PATH,
      createImageDto.path, // POSTS_IMAGE_PATH에 저장될 파일 이름
    );

    const result = await imageRepository.save({ ...createImageDto });

    // TEMP_IMAGE_PATH에 저장된 파일을 POSTS_IMAGE_PATH로 이동시킨다.
    await promises.rename(tempImagePath, postImagePath);

    return result;
  }
}
