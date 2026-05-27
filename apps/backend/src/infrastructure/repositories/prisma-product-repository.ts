import { PrismaClient } from '@prisma/client';
import {
  Money,
  Product,
  ProductCategory,
  ProductFilter,
  ProductRepository
} from '@food-orders/domain';

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(product: Product): Promise<void> {
    await this.prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        priceInCents: product.price.amountInCents,
        currency: product.price.currency,
        category: product.category,
        available: product.available,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      },
      update: {
        name: product.name,
        description: product.description,
        priceInCents: product.price.amountInCents,
        currency: product.price.currency,
        category: product.category,
        available: product.available,
        updatedAt: product.updatedAt
      }
    });
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(filter?: ProductFilter): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: {
        category: filter?.category,
        available: filter?.availableOnly ? true : undefined
      },
      orderBy: { name: 'asc' }
    });
    return rows.map(r => this.toDomain(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  private toDomain(row: {
    id: string;
    name: string;
    description: string;
    priceInCents: number;
    currency: string;
    category: string;
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return Product.create({
      id: row.id,
      name: row.name,
      description: row.description,
      price: Money.fromCents(row.priceInCents, row.currency as 'ARS' | 'USD'),
      category: row.category as ProductCategory,
      available: row.available,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
}
