import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { OrderStatus } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
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

    const groupedItems = new Map<string, number>();

    for (const item of dto.items) {
      groupedItems.set(
        item.productId,
        (groupedItems.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const normalizedItems = Array.from(groupedItems.entries()).map(
      ([productId, quantity]) => ({
        productId,
        quantity,
      }),
    );

    const productIds = normalizedItems.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: {
        companyId: dto.companyId,
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException(
        'Siparişteki ürünlerden biri bulunamadı.',
      );
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const preparedItems = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException('Ürün bulunamadı.');
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `${product.name} için yeterli stok yok. Mevcut stok: ${product.stock}`,
        );
      }

      const unitPrice = Number(product.price);
      const totalPrice = unitPrice * item.quantity;

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    const subtotal = preparedItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    const shippingAmount = dto.shippingAmount ?? 0;
    const discountAmount = dto.discountAmount ?? 0;

    if (discountAmount > subtotal + shippingAmount) {
      throw new BadRequestException(
        'İndirim tutarı sipariş toplamından büyük olamaz.',
      );
    }

    const totalAmount =
      subtotal + shippingAmount - discountAmount;

    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll('-', '');

    const uniquePart = randomUUID()
      .replaceAll('-', '')
      .slice(0, 6)
      .toUpperCase();

    const orderNumber = `SIP-${datePart}-${uniquePart}`;

    return this.prisma.$transaction(async (tx) => {
      for (const item of preparedItems) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            companyId: dto.companyId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new BadRequestException(
            `${item.productName} için yeterli stok kalmadı.`,
          );
        }
      }

      return tx.order.create({
        data: {
          companyId: dto.companyId,
          customerId: dto.customerId ?? null,
          orderNumber,
          subtotal,
          shippingAmount,
          discountAmount,
          totalAmount,
          customerNote: dto.customerNote?.trim() || null,
          internalNote: dto.internalNote?.trim() || null,
          shippingName: dto.shippingName?.trim() || null,
          shippingPhone: dto.shippingPhone?.trim() || null,
          shippingCity: dto.shippingCity?.trim() || null,
          shippingDistrict: dto.shippingDistrict?.trim() || null,
          shippingAddress: dto.shippingAddress?.trim() || null,
          items: {
            create: preparedItems,
          },
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
      });
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
  async findOne(id: string, companyId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        customer: true,
        items: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı.');
    }

    return order;
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.order.delete({
      where: {
        id,
      },
    });
  }

async updateStatus(
  id: string,
  companyId: string,
  status: OrderStatus,
) {
  await this.findOne(id, companyId);

  return this.prisma.order.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}
}