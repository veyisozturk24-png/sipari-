import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Logger,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

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
    this.logger.log('WhatsApp webhook isteği alındı.');

    if (!this.whatsAppService.isSignatureValid(request.rawBody, request.headers['x-hub-signature-256'])) {
      this.logger.warn('WhatsApp webhook imzası doğrulanamadı.');
      throw new ForbiddenException('Webhook imzası geçersiz.');
    }

    await this.whatsAppService.receiveWebhook(payload);
    this.logger.log('WhatsApp webhook isteği başarıyla işlendi.');
    return { received: true };
  }
}
