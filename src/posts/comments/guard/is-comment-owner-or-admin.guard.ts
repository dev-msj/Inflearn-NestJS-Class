import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesEnum } from 'src/users/const/rules.enum';
import { CommentsService } from '../comments.service';

@Injectable()
export class IsCommentOwnerOrAdminGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const postId = request.params.postId;
    if (!postId) {
      throw new BadRequestException('Post ID가 제공되지 않았습니다.');
    }
    const commentId = request.params.commentId;
    if (!commentId) {
      throw new BadRequestException('Comment ID가 제공되지 않았습니다.');
    }

    const isOwner = await this.commentsService.checkCommentModelExists(
      parseInt(commentId),
      parseInt(postId),
      user,
    );
    if (!isOwner) {
      throw new ForbiddenException('해당 리소스에 대한 권한이 없습니다.');
    }

    return true;
  }
}
