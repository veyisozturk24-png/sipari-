import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class InstagramService {
  constructor(private readonly config: ConfigService) {}

  isVerifyTokenValid(token?: string) {
    const expected = this.config.get<string>('INSTAGRAM_WEBHOOK_VERIFY_TOKEN');
    return Boolean(expected && token && expected.length === token.length && timingSafeEqual(Buffer.from(expected), Buffer.from(token)));
  }

  isSignatureValid(rawBody?: Buffer, signature?: string) {
    const secret = this.config.get<string>('INSTAGRAM_APP_SECRET');
    if (!rawBody || !signature || !secret) return false;
    const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
