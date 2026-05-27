import { Product } from '../entities';
import { ProductFilter, ProductRepository } from '../repositories';

export class InMemoryProductRepository implements ProductRepository {
  private products = new Map<string, Product>();

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findAll(filter?: ProductFilter): Promise<Product[]> {
    let result = Array.from(this.products.values());
    if (filter?.category) {
      result = result.filter(p => p.category === filter.category);
    }
    if (filter?.availableOnly) {
      result = result.filter(p => p.available);
    }
    return result;
  }

  async delete(id: string): Promise<void> {
    this.products.delete(id);
  }
}
