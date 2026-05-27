import { Product } from '../../entities';
import { ProductRepository } from '../../repositories';
import { NotFoundError } from '../../errors';

export class GetProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) {
      throw new NotFoundError(`Product ${id} not found`);
    }
    return product;
  }
}
