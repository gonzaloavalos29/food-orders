import { Product, ProductCategory, User } from '../../entities';
import { ProductRepository } from '../../repositories';
import { Clock, IdGenerator } from '../../services';
import { Money } from '../../value-objects';
import { AuthorizationError } from '../../errors';

export interface CreateProductInput {
  name: string;
  description: string;
  priceInCents: number;
  category: ProductCategory;
  available: boolean;
}

export class CreateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  async execute(actor: User, input: CreateProductInput): Promise<Product> {
    if (!actor.canManageProducts()) {
      throw new AuthorizationError('Only admins can create products');
    }
    const now = this.clock.now();
    const product = Product.create({
      id: this.ids.generate(),
      name: input.name,
      description: input.description,
      price: Money.fromCents(input.priceInCents),
      category: input.category,
      available: input.available,
      createdAt: now,
      updatedAt: now
    });
    await this.products.save(product);
    return product;
  }
}
