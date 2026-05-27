import { PrismaClient } from '@prisma/client';
import { Cart, CartRepository, Money } from '@food-orders/domain';

export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    });
    if (!cart) return null;
    return Cart.restore(
      cart.userId,
      cart.items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: Money.fromCents(i.unitPriceInCents, i.currency as 'ARS' | 'USD'),
        quantity: i.quantity
      }))
    );
  }

  async save(cart: Cart): Promise<void> {
    await this.prisma.$transaction(async tx => {
      const existing = await tx.cart.findUnique({ where: { userId: cart.userId } });
      const cartId = existing?.id ?? (await tx.cart.create({ data: { userId: cart.userId } })).id;
      await tx.cartItem.deleteMany({ where: { cartId } });
      if (cart.items.length > 0) {
        await tx.cartItem.createMany({
          data: cart.items.map(i => ({
            cartId,
            productId: i.productId,
            productName: i.productName,
            unitPriceInCents: i.unitPrice.amountInCents,
            currency: i.unitPrice.currency,
            quantity: i.quantity
          }))
        });
      }
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.cart.deleteMany({ where: { userId } });
  }
}
