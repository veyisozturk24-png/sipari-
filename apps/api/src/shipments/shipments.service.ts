import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, ShipmentStatus } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.shipment.findMany({
      where: { companyId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            shippingName: true,
            customer: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateShipmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: dto.orderId, companyId: dto.companyId },
        select: { id: true, status: true, shipment: { select: { id: true } } },
      });

      if (!order) {
        throw new NotFoundException('Sipariş bulunamadı.');
      }

      if (order.shipment) {
        throw new ConflictException(
          'Bu sipariş için zaten bir kargo kaydı var.',
        );
      }

      if (order.status !== OrderStatus.PREPARING) {
        throw new BadRequestException(
          'Kargo oluşturmak için siparişin hazırlanıyor durumunda olması gerekir.',
        );
      }

      return tx.shipment.create({
        data: {
          companyId: dto.companyId,
          orderId: dto.orderId,
          carrier: dto.carrier,
          trackingNumber: dto.trackingNumber.trim(),
          status: ShipmentStatus.PREPARING,
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              shippingName: true,
              customer: { select: { name: true } },
            },
          },
        },
      });
    });
  }

  async updateStatus(id: string, companyId: string, status: ShipmentStatus) {
    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findFirst({
        where: { id, companyId },
        include: { order: { select: { id: true, status: true } } },
      });

      if (!shipment) {
        throw new NotFoundException('Kargo kaydı bulunamadı.');
      }

      if (shipment.status === status) {
        return this.findOne(id, companyId);
      }

      if (!this.canTransition(shipment.status, status)) {
        throw new BadRequestException('Kargo durumu bu adıma geçirilemez.');
      }

      const orderStatus = this.getOrderStatus(status);

      if (orderStatus) {
        await tx.order.update({
          where: { id: shipment.order.id },
          data: { status: orderStatus },
        });
      }

      return tx.shipment.update({
        where: { id },
        data: {
          status,
          shippedAt: status === ShipmentStatus.SHIPPED ? new Date() : undefined,
          deliveredAt:
            status === ShipmentStatus.DELIVERED ? new Date() : undefined,
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              shippingName: true,
              customer: { select: { name: true } },
            },
          },
        },
      });
    });
  }

  private async findOne(id: string, companyId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, companyId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            shippingName: true,
            customer: { select: { name: true } },
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Kargo kaydı bulunamadı.');
    }

    return shipment;
  }

  private canTransition(from: ShipmentStatus, to: ShipmentStatus) {
    const transitions: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
      [ShipmentStatus.PREPARING]: [
        ShipmentStatus.READY,
        ShipmentStatus.SHIPPED,
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERED,
      ],
      [ShipmentStatus.READY]: [
        ShipmentStatus.SHIPPED,
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERED,
      ],
      [ShipmentStatus.SHIPPED]: [
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERED,
      ],
      [ShipmentStatus.IN_TRANSIT]: [
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERED,
      ],
      [ShipmentStatus.OUT_FOR_DELIVERY]: [ShipmentStatus.DELIVERED],
    };

    return transitions[from]?.includes(to) ?? false;
  }

  private getOrderStatus(status: ShipmentStatus) {
    if (status === ShipmentStatus.SHIPPED) {
      return OrderStatus.SHIPPED;
    }

    if (status === ShipmentStatus.DELIVERED) {
      return OrderStatus.DELIVERED;
    }

    return undefined;
  }
}
