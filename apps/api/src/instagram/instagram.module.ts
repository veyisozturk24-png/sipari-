import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InstagramController } from './instagram.controller';
import { InstagramWebhookController } from './instagram-webhook.controller';
import { InstagramService } from './instagram.service';

@Module({
  imports: [AuthModule],
  controllers: [InstagramController, InstagramWebhookController],
  providers: [InstagramService],
})
export class InstagramModule {}
