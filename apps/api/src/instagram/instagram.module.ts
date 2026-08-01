import { Module } from '@nestjs/common';
import { InstagramWebhookController } from './instagram-webhook.controller';
import { InstagramService } from './instagram.service';

@Module({ controllers: [InstagramWebhookController], providers: [InstagramService] })
export class InstagramModule {}
