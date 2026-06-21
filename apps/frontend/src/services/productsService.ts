import { api } from '../api/client';
import type { ProductCategory, ProductDto } from '../api/types';

export type CategoryFilter = ProductCategory | 'ALL';

type CreateProductInput = Omit<ProductDto, 'id' | 'createdAt' | 'updatedAt' | 'currency'>;
type UpdateProductInput = Partial<CreateProductInput>;

/**
 * Client-side application layer for products. Encapsulates the rules that used
 * to live inside the pages (e.g. the "ALL" category meaning "no filter") and
 * unwraps the API envelope so components receive plain domain DTOs.
 */
export const productsService = {
  list: (category: CategoryFilter = 'ALL'): Promise<ProductDto[]> =>
    api.products
      .list({ category: category === 'ALL' ? undefined : category })
      .then(r => r.products),

  /** Catalog used by the admin: includes paused (unavailable) products. */
  listAll: (): Promise<ProductDto[]> =>
    api.products.list({ includeUnavailable: true }).then(r => r.products),

  get: (id: string): Promise<ProductDto> => api.products.get(id).then(r => r.product),

  create: (input: CreateProductInput): Promise<ProductDto> =>
    api.products.create(input).then(r => r.product),

  update: (id: string, input: UpdateProductInput): Promise<ProductDto> =>
    api.products.update(id, input).then(r => r.product),

  /** Toggle availability without the caller having to know the PATCH shape. */
  setAvailable: (id: string, available: boolean): Promise<ProductDto> =>
    api.products.update(id, { available }).then(r => r.product),

  remove: (id: string): Promise<void> => api.products.remove(id)
};
