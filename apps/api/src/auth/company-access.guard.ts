import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MemberStatus } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      query: { companyId?: string };
      body?: { companyId?: string };
      user: { userId: string };
    }>();
    const companyId = request.query.companyId ?? request.body?.companyId;

    if (!companyId) {
      throw new ForbiddenException('İşletme bilgisi gerekli.');
    }

    const membership = await this.prisma.companyMember.findFirst({
      where: {
        companyId,
        userId: request.user.userId,
        status: MemberStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!membership) {
      throw new ForbiddenException('Bu işletmeye erişim yetkiniz yok.');
    }

    return true;
  }
}
