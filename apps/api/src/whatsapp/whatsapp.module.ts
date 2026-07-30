import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';

@Module({
  imports: [AuthModule],
  controllers: [WhatsAppController, WhatsAppWebhookController],
  providers: [WhatsAppService],
})
export class WhatsAppModule {}
