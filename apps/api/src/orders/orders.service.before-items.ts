import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: {
          id: dto.customerId,
          companyId: dto.companyId,
        },
        select: {
          id: true,
        },
      });

      if (!customer) {
        throw new NotFoundException(
          'Seçilen müşteri bu şirkette bulunamadı.',
        );
      }
    }

    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll('-', '');

    const uniquePart = randomUUID()
      .replaceAll('-', '')
      .slice(0, 6)
      .toLocaleUpperCase('tr-TR');

    const orderNumber = `SIP-${datePart}-${uniquePart}`;

    return this.prisma.order.create({
      data: {
        companyId: dto.companyId,
        customerId: dto.customerId ?? null,
        orderNumber,
        customerNote: dto.customerNote?.trim() || null,
        internalNote: dto.internalNote?.trim() || null,
        shippingName: dto.shippingName?.trim() || null,
        shippingPhone: dto.shippingPhone?.trim() || null,
        shippingCity: dto.shippingCity?.trim() || null,
        shippingDistrict: dto.shippingDistrict?.trim() || null,
        shippingAddress: dto.shippingAddress?.trim() || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        items: true,
        shipment: true,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.order.findMany({
      where: {
        companyId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        shipment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
