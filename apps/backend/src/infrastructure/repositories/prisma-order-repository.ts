import { PrismaClient } from '@prisma/client';
import {
  Money,
  Order,
  OrderFilter,
  OrderRepository,
  OrderStatus
} from '@food-orders/domain';

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(order: Order): Promise<void> {
    await this.prisma.$transaction(async tx => {
      await tx.order.upsert({
        where: { id: order.id },
        create: {
          id: order.id,
          userId: order.userId,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        },
        update: {
          status: order.status,
          updatedAt: order.updatedAt
        }
      });
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      await tx.orderItem.createMany({
        data: order.items.map(i => ({
          orderId: order.id,
          productId: i.productId,
          productName: i.productName,
          unitPriceInCents: i.unitPrice.amountInCents,
          currency: i.unitPrice.currency,
          quantity: i.quantity
        }))
      });
    });
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(filter?: OrderFilter): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { userId: filter?.userId, status: filter?.status },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    return rows.map(r => this.toDomain(r));
  }

  private toDomain(row: {
    id: string;
    userId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      productId: string;
      productName: string;
      unitPriceInCents: number;
      currency: string;
      quantity: number;
    }>;
  }): Order {
    return Order.create({
      id: row.id,
      userId: row.userId,
      status: row.status as OrderStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      items: row.items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: Money.fromCents(i.unitPriceInCents, i.currency as 'ARS' | 'USD'),
        quantity: i.quantity
      }))
    });
  }
}
