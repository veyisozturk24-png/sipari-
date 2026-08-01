import { Module } from '@nestjs/common';
import { InstagramController } from './instagram.controller';
import { InstagramWebhookController } from './instagram-webhook.controller';
import { InstagramService } from './instagram.service';

@Module({
  controllers: [InstagramController, InstagramWebhookController],
  providers: [InstagramService],
})
export class InstagramModule {}
