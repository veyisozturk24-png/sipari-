import { Injectable } from '@nestjs/common';
import { ChannelStatus, OrderStatus, ProductStatus } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(companyId: string) {
    const today = this.startOfDay(new Date());
    const startDate = this.startOfDay(new Date());
    startDate.setDate(startDate.getDate() - 29);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      customerCount,
      statusCounts,
      recentOrders,
      orderItems,
      products,
      salesOrders,
      channelConnections,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { companyId },
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          companyId,
          createdAt: { gte: today },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
        },
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({
        where: {
          companyId,
          status: {
            in: [
              OrderStatus.DRAFT,
              OrderStatus.PENDING,
              OrderStatus.CONFIRMED,
              OrderStatus.PREPARING,
            ],
          },
        },
      }),
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { _all: true },
      }),
      this.prisma.order.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          items: {
            select: { id: true, productName: true, quantity: true, totalPrice: true },
            orderBy: { createdAt: 'asc' },
          },
          shipment: { select: { status: true, trackingNumber: true } },
        },
      }),
      this.prisma.orderItem.findMany({
        where: { order: { companyId } },
        select: { productId: true, productName: true, sku: true, quantity: true, totalPrice: true },
      }),
      this.prisma.product.findMany({
        where: { companyId, status: { not: ProductStatus.PASSIVE } },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          criticalStock: true,
          status: true,
        },
        orderBy: { stock: 'asc' },
      }),
      this.prisma.order.findMany({
        where: {
          companyId,
          createdAt: { gte: startDate },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
        },
        select: { createdAt: true, totalAmount: true },
      }),
      this.prisma.channelConnection.findMany({
        where: { companyId },
        select: {
          id: true,
          name: true,
          platform: true,
          status: true,
          _count: { select: { conversations: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const channels = await Promise.all(
      channelConnections.map(async (channel) => ({
        name: channel.name,
        platform: channel.platform,
        status: channel.status,
        conversations: channel._count.conversations,
        messages: await this.prisma.message.count({
          where: { conversation: { channelId: channel.id } },
        }),
      })),
    );

    const orderStatusMap = new Map(
      statusCounts.map((item) => [item.status, item._count._all]),
    );
    const topProducts = this.getTopProducts(orderItems);
    const criticalStock = products
      .filter((product) => product.stock <= product.criticalStock)
      .slice(0, 10);

    return {
      overview: {
        totalOrders: totalOrders._count._all,
        totalRevenue: Number(totalOrders._sum.totalAmount ?? 0),
        todayOrders: todayOrders._count._all,
        todayRevenue: Number(todayOrders._sum.totalAmount ?? 0),
        pendingOrders,
        customers: customerCount,
      },
      orderStatuses: Object.values(OrderStatus).map((status) => ({
        status,
        count: orderStatusMap.get(status) ?? 0,
      })),
      recentOrders,
      topProducts,
      criticalStock,
      salesLast30Days: this.getDailySales(startDate, salesOrders),
      channels: channels.map((channel) => ({
        ...channel,
        isConnected: channel.status === ChannelStatus.CONNECTED,
      })),
    };
  }

  private getTopProducts(
    items: Array<{
      productId: string | null;
      productName: string;
      sku: string | null;
      quantity: number;
      totalPrice: { toString(): string };
    }>,
  ) {
    const products = new Map<
      string,
      { productId: string | null; name: string; sku: string | null; quantity: number; revenue: number }
    >();

    for (const item of items) {
      const key = item.productId ?? `${item.productName}-${item.sku ?? ''}`;
      const current = products.get(key) ?? {
        productId: item.productId,
        name: item.productName,
        sku: item.sku,
        quantity: 0,
        revenue: 0,
      };

      current.quantity += item.quantity;
      current.revenue += Number(item.totalPrice);
      products.set(key, current);
    }

    return [...products.values()]
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 5);
  }

  private getDailySales(
    startDate: Date,
    orders: Array<{ createdAt: Date; totalAmount: { toString(): string } }>,
  ) {
    const totals = new Map<string, { orders: number; revenue: number }>();

    for (const order of orders) {
      const key = this.toDateKey(order.createdAt);
      const current = totals.get(key) ?? { orders: 0, revenue: 0 };
      current.orders += 1;
      current.revenue += Number(order.totalAmount);
      totals.set(key, current);
    }

    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const key = this.toDateKey(date);
      const value = totals.get(key) ?? { orders: 0, revenue: 0 };

      return { date: key, ...value };
    });
  }

  private startOfDay(date: Date) {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private toDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }
}
