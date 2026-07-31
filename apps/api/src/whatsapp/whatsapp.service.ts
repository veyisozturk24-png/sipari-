import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  NotFoundException,
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
import { SendWhatsAppMessageDto } from './dto/send-whatsapp-message.dto';

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

type WhatsAppSendResponse = {
  messages?: Array<{ id?: string }>;
  error?: { message?: string };
};

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.subscribeAppToBusinessAccount();
  }

  findChannels(companyId: string) {
    return this.prisma.channelConnection.findMany({
      where: { companyId, platform: ChannelPlatform.WHATSAPP },
      orderBy: { createdAt: 'desc' },
    });
  }

  findConversations(companyId: string) {
    return this.prisma.conversation.findMany({
      where: {
        companyId,
        channel: { platform: ChannelPlatform.WHATSAPP },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        channel: { select: { id: true, name: true, platform: true } },
        messages: {
          orderBy: [{ sentAt: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            direction: true,
            type: true,
            text: true,
            sentAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
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

  async sendMessage(dto: SendWhatsAppMessageDto) {
    const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');

    if (!accessToken) {
      throw new BadRequestException('WhatsApp mesaj anahtarı henüz Railway’e eklenmedi.');
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: { id: dto.conversationId, companyId: dto.companyId },
      include: {
        customer: { select: { phone: true } },
        channel: { select: { platform: true, status: true, externalAccountId: true } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('WhatsApp konuşması bulunamadı.');
    }

    if (
      conversation.channel.platform !== ChannelPlatform.WHATSAPP ||
      conversation.channel.status !== ChannelStatus.CONNECTED ||
      !conversation.channel.externalAccountId
    ) {
      throw new BadRequestException('Bu konuşma için aktif bir WhatsApp kanalı yok.');
    }

    const recipient = conversation.customer.phone?.replace(/\D/g, '');

    if (!recipient) {
      throw new BadRequestException('Müşterinin WhatsApp telefon numarası bulunamadı.');
    }

    const response = await fetch(
      `https://graph.facebook.com/v25.0/${conversation.channel.externalAccountId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'text',
          text: { body: dto.text.trim() },
        }),
      },
    );

    const payload = await response.json().catch(() => ({})) as WhatsAppSendResponse;

    if (!response.ok) {
      this.logger.error(`WhatsApp mesajı gönderilemedi: ${payload.error?.message ?? response.statusText}`);
      throw new BadGatewayException('WhatsApp mesajı gönderilemedi. Meta erişim anahtarını ve test alıcısını kontrol et.');
    }

    const sentAt = new Date();
    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        externalId: payload.messages?.[0]?.id,
        direction: MessageDirection.OUTBOUND,
        type: MessageType.TEXT,
        text: dto.text.trim(),
        sentAt,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: sentAt },
    });

    return message;
  }

  private async subscribeAppToBusinessAccount() {
    const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
    const businessAccountId = this.configService.get<string>('WHATSAPP_BUSINESS_ACCOUNT_ID');

    if (!accessToken || !businessAccountId) {
      this.logger.log('WhatsApp Business Account aboneliği için yapılandırma bekleniyor.');
      return;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v26.0/${businessAccountId}/subscribed_apps`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!response.ok) {
        this.logger.warn(`WhatsApp Business Account aboneliği kurulamadı: ${response.status}`);
        return;
      }

      this.logger.log('WhatsApp Business Account webhook aboneliği aktif.');
    } catch {
      this.logger.warn('WhatsApp Business Account aboneliği kurulurken Meta’ya ulaşılamadı.');
    }
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
