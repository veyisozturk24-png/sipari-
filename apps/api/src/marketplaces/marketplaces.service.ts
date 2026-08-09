import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import {
  MarketplacePlatform,
  MarketplaceStatus,
} from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';
import { ConfigureTrendyolDto } from './dto/configure-trendyol.dto';

type TrendyolVerification = { ok: true } | { ok: false; message: string };

@Injectable()
export class MarketplacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  findAll(companyId: string) {
    return this.prisma.marketplaceConnection.findMany({
      where: { companyId },
      select: {
        id: true,
        platform: true,
        merchantId: true,
        status: true,
        lastCheckedAt: true,
        lastError: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async configureTrendyol(dto: ConfigureTrendyolDto) {
    const merchantId = dto.merchantId.trim();
    const verification = await this.verifyTrendyol(
      merchantId,
      dto.apiKey.trim(),
      dto.apiSecret.trim(),
    );

    if (!verification.ok) {
      throw new BadGatewayException(verification.message);
    }

    const data = {
      merchantId,
      apiKeyEncrypted: this.encrypt(dto.apiKey.trim()),
      apiSecretEncrypted: this.encrypt(dto.apiSecret.trim()),
      status: MarketplaceStatus.CONNECTED,
      lastCheckedAt: new Date(),
      lastError: null,
    };

    return this.prisma.marketplaceConnection.upsert({
      where: {
        companyId_platform: {
          companyId: dto.companyId,
          platform: MarketplacePlatform.TRENDYOL,
        },
      },
      create: {
        companyId: dto.companyId,
        platform: MarketplacePlatform.TRENDYOL,
        ...data,
      },
      update: data,
      select: {
        id: true,
        platform: true,
        merchantId: true,
        status: true,
        lastCheckedAt: true,
        lastError: true,
        updatedAt: true,
      },
    });
  }

  private async verifyTrendyol(
    merchantId: string,
    apiKey: string,
    apiSecret: string,
  ): Promise<TrendyolVerification> {
    const basicToken = Buffer.from(`${merchantId}:${apiKey}:${apiSecret}`).toString('base64');

    try {
      const response = await fetch(
        `https://apigw.trendyol.com/integration/product/sellers/${encodeURIComponent(merchantId)}/products?approved=true&page=0&size=1`,
        {
          headers: {
            Authorization: `Basic ${basicToken}`,
            'User-Agent': 'SiparisYonetim/1.0',
          },
          signal: AbortSignal.timeout(10_000),
        },
      );

      if (response.ok) return { ok: true };

      if (response.status === 401 || response.status === 403) {
        return { ok: false, message: 'Trendyol mağaza ID veya API anahtarları doğrulanamadı.' };
      }

      return { ok: false, message: `Trendyol bağlantısı şu an doğrulanamadı (HTTP ${response.status}).` };
    } catch {
      return { ok: false, message: 'Trendyol bağlantısı zaman aşımına uğradı. Bilgileri kontrol edip tekrar dene.' };
    }
  }

  private encrypt(value: string) {
    const secret = this.config.get<string>('MARKETPLACE_ENCRYPTION_KEY');
    if (!secret) {
      throw new BadRequestException('Pazaryeri güvenlik anahtarı henüz Railway’e eklenmedi.');
    }

    const key = createHash('sha256').update(secret).digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
  }

  // Future order synchronization will use this only on the server; it is never returned to the browser.
  private decrypt(encryptedValue: string) {
    const secret = this.config.get<string>('MARKETPLACE_ENCRYPTION_KEY');
    if (!secret) throw new BadRequestException('Pazaryeri güvenlik anahtarı tanımlı değil.');
    const [ivValue, tagValue, payload] = encryptedValue.split('.');
    const key = createHash('sha256').update(secret).digest();
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivValue, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(payload, 'base64url')), decipher.final()]).toString('utf8');
  }
}
