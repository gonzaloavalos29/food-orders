import { Product, ProductCategory, User } from '../../entities';
import { ProductFilter, ProductRepository } from '../../repositories';

export interface ListProductsInput {
  category?: ProductCategory;
  includeUnavailable?: boolean;
}

export class ListProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(actor: User | null, input: ListProductsInput = {}): Promise<Product[]> {
    const filter: ProductFilter = { category: input.category };
    if (!actor?.canManageProducts() && !input.includeUnavailable) {
      filter.availableOnly = true;
    }
    return this.products.findAll(filter);
  }
}
