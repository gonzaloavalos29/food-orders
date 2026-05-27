import { User } from '../../entities';
import { ProductRepository } from '../../repositories';
import { AuthorizationError, NotFoundError } from '../../errors';

export class DeleteProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(actor: User, id: string): Promise<void> {
    if (!actor.canManageProducts()) {
      throw new AuthorizationError('Only admins can delete products');
    }
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new NotFoundError(`Product ${id} not found`);
    }
    await this.products.delete(id);
  }
}
