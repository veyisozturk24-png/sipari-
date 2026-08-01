import { Body, Controller, ForbiddenException, Get, Header, Post, Query, Req } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Controller('webhooks/instagram')
export class InstagramWebhookController {
  constructor(private readonly instagram: InstagramService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  verify(@Query() query: Record<string, string>) {
    if (query['hub.mode'] !== 'subscribe' || !query['hub.challenge'] || !this.instagram.isVerifyTokenValid(query['hub.verify_token'])) {
      throw new ForbiddenException('Instagram webhook doğrulanamadı.');
    }
    return query['hub.challenge'];
  }

  @Post()
  receive(@Body() _payload: unknown, @Req() request: { rawBody?: Buffer; headers: { 'x-hub-signature-256'?: string } }) {
    if (!this.instagram.isSignatureValid(request.rawBody, request.headers['x-hub-signature-256'])) {
      throw new ForbiddenException('Instagram webhook imzası geçersiz.');
    }
    return { received: true };
  }
}
