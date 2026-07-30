import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  ChannelPlatform,
  ChannelStatus,
  MessageDirection,
  MessageType,
} from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';
import { ConfigureWhatsAppDto } from './dto/configure-whatsapp.dto';

type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
        messages?: Array<{
          id?: string;
          from?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
        }>;
      };
    }>;
  }>;
};

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  findChannels(companyId: string) {
    return this.prisma.channelConnection.findMany({
      where: { companyId, platform: ChannelPlatform.WHATSAPP },
      orderBy: { createdAt: 'desc' },
    });
  }

  async configureChannel(dto: ConfigureWhatsAppDto) {
    const phoneNumberId = dto.phoneNumberId.trim();
    const name = dto.displayName.trim();
    const existing = await this.prisma.channelConnection.findFirst({
      where: {
        companyId: dto.companyId,
        platform: ChannelPlatform.WHATSAPP,
        externalAccountId: phoneNumberId,
      },
    });

    if (existing) {
      return this.prisma.channelConnection.update({
        where: { id: existing.id },
        data: { name, status: ChannelStatus.CONNECTED },
      });
    }

    return this.prisma.channelConnection.create({
      data: {
        companyId: dto.companyId,
        platform: ChannelPlatform.WHATSAPP,
        name,
        externalAccountId: phoneNumberId,
        status: ChannelStatus.CONNECTED,
      },
    });
  }

  isVerifyTokenValid(token: string | undefined) {
    const expected = this.configService.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN');

    if (!expected || !token || expected.length !== token.length) {
      return false;
    }

    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  }

  isSignatureValid(rawBody: Buffer | undefined, signature: string | undefined) {
    const appSecret = this.configService.get<string>('WHATSAPP_APP_SECRET');

    if (!rawBody || !signature || !appSecret) {
      return false;
    }

    const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
    return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  async receiveWebhook(rawPayload: unknown) {
    const payload = rawPayload as WhatsAppWebhookPayload;

    if (payload.object !== 'whatsapp_business_account') {
      return;
    }

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phoneNumberId = value?.metadata?.phone_number_id;

        if (!phoneNumberId) {
          continue;
        }

        const channel = await this.prisma.channelConnection.findFirst({
          where: {
            platform: ChannelPlatform.WHATSAPP,
            externalAccountId: phoneNumberId,
            status: ChannelStatus.CONNECTED,
          },
        });

        if (!channel) {
          this.logger.warn(`WhatsApp webhook received for an unconnected phone number: ${phoneNumberId}`);
          continue;
        }

        for (const message of value?.messages ?? []) {
          if (!message.id || !message.from) {
            continue;
          }

          const alreadyReceived = await this.prisma.message.findFirst({
            where: { externalId: message.id },
            select: { id: true },
          });

          if (alreadyReceived) {
            continue;
          }

          const contact = value?.contacts?.find((item) => item.wa_id === message.from);
          const contactName = contact?.profile?.name?.trim() || `WhatsApp ${message.from}`;
          const sentAt = message.timestamp ? new Date(Number(message.timestamp) * 1000) : new Date();

          await this.prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findFirst({
              where: { companyId: channel.companyId, phone: message.from },
              orderBy: { createdAt: 'asc' },
            }) ?? await tx.customer.create({
              data: { companyId: channel.companyId, name: contactName, phone: message.from },
            });

            const conversation = await tx.conversation.findFirst({
              where: {
                companyId: channel.companyId,
                customerId: customer.id,
                channelId: channel.id,
              },
              orderBy: { updatedAt: 'desc' },
            }) ?? await tx.conversation.create({
              data: {
                companyId: channel.companyId,
                customerId: customer.id,
                channelId: channel.id,
              },
            });

            await tx.message.create({
              data: {
                conversationId: conversation.id,
                externalId: message.id,
                direction: MessageDirection.INBOUND,
                type: this.toMessageType(message.type),
                text: message.text?.body ?? null,
                sentAt,
              },
            });

            await tx.conversation.update({
              where: { id: conversation.id },
              data: { lastMessageAt: sentAt },
            });
          });
        }
      }
    }
  }

  private toMessageType(type: string | undefined): MessageType {
    const types: Record<string, MessageType> = {
      text: MessageType.TEXT,
      image: MessageType.IMAGE,
      video: MessageType.VIDEO,
      audio: MessageType.AUDIO,
      document: MessageType.FILE,
      location: MessageType.LOCATION,
      sticker: MessageType.STICKER,
    };

    return types[type ?? ''] ?? MessageType.SYSTEM;
  }
}
