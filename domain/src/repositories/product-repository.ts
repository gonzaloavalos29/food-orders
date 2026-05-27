import { Product, ProductCategory } from '../entities';

export interface ProductFilter {
  category?: ProductCategory;
  availableOnly?: boolean;
}

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findAll(filter?: ProductFilter): Promise<Product[]>;
  delete(id: string): Promise<void>;
}
