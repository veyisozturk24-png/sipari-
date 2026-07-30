import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  verify(@Query() query: Record<string, string>) {
    const mode = query['hub.mode'];
    const verifyToken = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode !== 'subscribe' || !challenge || !this.whatsAppService.isVerifyTokenValid(verifyToken)) {
      throw new ForbiddenException('Webhook doğrulanamadı.');
    }

    return challenge;
  }

  @Post()
  async receive(
    @Body() payload: unknown,
    @Req() request: { rawBody?: Buffer; headers: { 'x-hub-signature-256'?: string } },
  ) {
    if (!this.whatsAppService.isSignatureValid(request.rawBody, request.headers['x-hub-signature-256'])) {
      throw new ForbiddenException('Webhook imzası geçersiz.');
    }

    await this.whatsAppService.receiveWebhook(payload);
    return { received: true };
  }
}
