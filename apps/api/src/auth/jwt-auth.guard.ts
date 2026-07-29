import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { userId: string; email: string };
    }>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      throw new UnauthorizedException('Oturum açmanız gerekiyor.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      request.user = { userId: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
    }
  }
}
