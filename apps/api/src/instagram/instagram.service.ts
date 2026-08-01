import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
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
import { ConfigureInstagramDto } from './dto/configure-instagram.dto';
import { SendInstagramMessageDto } from './dto/send-instagram-message.dto';

type InstagramWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    messaging?: Array<{
      sender?: { id?: string };
      recipient?: { id?: string };
      timestamp?: number;
      message?: {
        mid?: string;
        text?: string;
        is_echo?: boolean;
        attachments?: unknown[];
      };
    }>;
  }>;
};

type InstagramProfileResponse = { id?: string; username?: string; error?: { message?: string } };
type InstagramSendResponse = { message_id?: string; error?: { message?: string } };

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  findChannels(companyId: string) {
    return this.prisma.channelConnection.findMany({
      where: { companyId, platform: ChannelPlatform.INSTAGRAM },
      orderBy: { createdAt: 'desc' },
    });
  }

  findConversations(companyId: string) {
    return this.prisma.conversation.findMany({
      where: { companyId, channel: { platform: ChannelPlatform.INSTAGRAM } },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            orders: {
              select: { orderNumber: true, totalAmount: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
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

  async configureChannel(dto: ConfigureInstagramDto) {
    const instagramAccountId = dto.instagramAccountId.trim();
    const token = this.config.get<string>('INSTAGRAM_ACCESS_TOKEN');

    if (!token) {
      throw new BadRequestException('Instagram erişim anahtarı henüz Railway’e eklenmedi.');
    }

    const profile = await this.getProfile(instagramAccountId, token);
    const name = dto.displayName.trim() || profile.username || 'Instagram';
    const existing = await this.prisma.channelConnection.findFirst({
      where: {
        companyId: dto.companyId,
        platform: ChannelPlatform.INSTAGRAM,
        externalAccountId: instagramAccountId,
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
        platform: ChannelPlatform.INSTAGRAM,
        name,
        externalAccountId: instagramAccountId,
        status: ChannelStatus.CONNECTED,
      },
    });
  }

  async sendMessage(dto: SendInstagramMessageDto) {
    const accessToken = this.config.get<string>('INSTAGRAM_ACCESS_TOKEN');
    if (!accessToken) {
      throw new BadRequestException('Instagram erişim anahtarı henüz Railway’e eklenmedi.');
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: { id: dto.conversationId, companyId: dto.companyId },
      include: {
        customer: { select: { notes: true } },
        channel: { select: { platform: true, status: true, externalAccountId: true } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Instagram konuşması bulunamadı.');
    }

    if (
      conversation.channel.platform !== ChannelPlatform.INSTAGRAM ||
      conversation.channel.status !== ChannelStatus.CONNECTED ||
      !conversation.channel.externalAccountId
    ) {
      throw new BadRequestException('Bu konuşma için aktif bir Instagram kanalı yok.');
    }

    const recipientId = this.instagramSenderId(conversation.customer.notes);
    if (!recipientId) {
      throw new BadRequestException('Instagram müşterisinin kimliği bulunamadı.');
    }

    const response = await fetch(
      `https://graph.instagram.com/v25.0/${conversation.channel.externalAccountId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: dto.text.trim() },
        }),
      },
    );

    const payload = await response.json().catch(() => ({})) as InstagramSendResponse;
    if (!response.ok) {
      this.logger.error(`Instagram mesajı gönderilemedi: ${payload.error?.message ?? response.statusText}`);
      throw new BadGatewayException('Instagram mesajı gönderilemedi. Erişim anahtarını ve Meta ayarlarını kontrol et.');
    }

    const sentAt = new Date();
    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        externalId: payload.message_id,
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

  async receiveWebhook(rawPayload: unknown) {
    const payload = rawPayload as InstagramWebhookPayload;
    if (payload.object !== 'instagram') return;

    for (const entry of payload.entry ?? []) {
      for (const messaging of entry.messaging ?? []) {
        const message = messaging.message;
        const senderId = messaging.sender?.id;
        if (!message?.mid || !senderId || message.is_echo) continue;

        const accountId = entry.id ?? messaging.recipient?.id;
        if (!accountId) continue;

        const channel = await this.prisma.channelConnection.findFirst({
          where: {
            platform: ChannelPlatform.INSTAGRAM,
            externalAccountId: accountId,
            status: ChannelStatus.CONNECTED,
          },
        });

        if (!channel) {
          this.logger.warn('Instagram webhook connected olmayan bir hesap için alındı.');
          continue;
        }

        const alreadyReceived = await this.prisma.message.findFirst({
          where: { externalId: message.mid },
          select: { id: true },
        });
        if (alreadyReceived) continue;

        const sentAt = messaging.timestamp ? new Date(messaging.timestamp) : new Date();
        const customerMarker = `instagram:${senderId}`;

        await this.prisma.$transaction(async (tx) => {
          const customer = await tx.customer.findFirst({
            where: { companyId: channel.companyId, notes: customerMarker },
            orderBy: { createdAt: 'asc' },
          }) ?? await tx.customer.create({
            data: {
              companyId: channel.companyId,
              name: `Instagram kullanıcısı ${senderId}`,
              notes: customerMarker,
            },
          });

          const conversation = await tx.conversation.findFirst({
            where: { companyId: channel.companyId, customerId: customer.id, channelId: channel.id },
            orderBy: { updatedAt: 'desc' },
          }) ?? await tx.conversation.create({
            data: { companyId: channel.companyId, customerId: customer.id, channelId: channel.id },
          });

          await tx.message.create({
            data: {
              conversationId: conversation.id,
              externalId: message.mid,
              direction: MessageDirection.INBOUND,
              type: message.attachments?.length ? MessageType.IMAGE : MessageType.TEXT,
              text: message.text ?? null,
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

  private async getProfile(accountId: string, accessToken: string) {
    const response = await fetch(
      `https://graph.instagram.com/v25.0/${accountId}?fields=id,username`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const payload = await response.json().catch(() => ({})) as InstagramProfileResponse;
    if (!response.ok || payload.id !== accountId) {
      this.logger.warn(`Instagram hesabı doğrulanamadı: ${payload.error?.message ?? response.statusText}`);
      throw new BadGatewayException('Instagram hesabı doğrulanamadı. Railway erişim anahtarını ve Instagram Account ID değerini kontrol et.');
    }
    return payload;
  }

  private instagramSenderId(notes: string | null) {
    return notes?.startsWith('instagram:') ? notes.slice('instagram:'.length) : undefined;
  }
}
