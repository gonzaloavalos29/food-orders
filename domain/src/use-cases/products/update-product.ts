import { Product, ProductCategory, User } from '../../entities';
import { ProductRepository } from '../../repositories';
import { Money } from '../../value-objects';
import { AuthorizationError, NotFoundError } from '../../errors';

export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  priceInCents?: number;
  category?: ProductCategory;
  available?: boolean;
}

export class UpdateProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(actor: User, input: UpdateProductInput): Promise<Product> {
    if (!actor.canManageProducts()) {
      throw new AuthorizationError('Only admins can update products');
    }
    const existing = await this.products.findById(input.id);
    if (!existing) {
      throw new NotFoundError(`Product ${input.id} not found`);
    }
    const updated = existing.update({
      name: input.name,
      description: input.description,
      price: input.priceInCents !== undefined ? Money.fromCents(input.priceInCents) : undefined,
      category: input.category,
      available: input.available
    });
    await this.products.save(updated);
    return updated;
  }
}
