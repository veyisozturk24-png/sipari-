import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { MemberRole, MemberStatus } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLocaleLowerCase('tr-TR');
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor.');
    }

    const password = await bcrypt.hash(dto.password, 12);
    const slug = this.createCompanySlug(dto.companyName);

    const user = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: dto.companyName.trim(), slug },
      });
      const createdUser = await tx.user.create({
        data: { name: dto.name.trim(), email, password },
      });

      await tx.companyMember.create({
        data: {
          companyId: company.id,
          userId: createdUser.id,
          role: MemberRole.OWNER,
          status: MemberStatus.ACTIVE,
        },
      });

      return createdUser;
    });

    return this.createSession(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLocaleLowerCase('tr-TR');
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, active: true },
    });

    if (!user || !user.active || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('E-posta veya parola hatalı.');
    }

    return this.createSession(user.id, user.email);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyMemberships: {
          where: { status: MemberStatus.ACTIVE },
          select: {
            role: true,
            company: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    return user;
  }

  private async createSession(userId: string, email: string) {
    const user = await this.getProfile(userId);
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ??
          '8h') as never,
      },
    );

    return { accessToken, user };
  }

  private createCompanySlug(companyName: string) {
    const base = companyName
      .trim()
      .toLocaleLowerCase('tr-TR')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'isletme';

    return `${base}-${randomUUID().slice(0, 8)}`;
  }
}
