import { Money } from '../value-objects';
import { ValidationError } from '../errors';

export type ProductCategory = 'PIZZA' | 'BURGER' | 'FRIES' | 'DRINK';

const VALID_CATEGORIES: ProductCategory[] = ['PIZZA', 'BURGER', 'FRIES', 'DRINK'];

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Money;
  category: ProductCategory;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  price?: Money;
  category?: ProductCategory;
  available?: boolean;
}

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static create(props: ProductProps): Product {
    if (!props.id || props.id.trim().length === 0) {
      throw new ValidationError('Product id is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('Product name is required');
    }
    if (props.price.amountInCents <= 0) {
      throw new ValidationError('Product price must be greater than zero');
    }
    if (!VALID_CATEGORIES.includes(props.category)) {
      throw new ValidationError(`Invalid product category: ${props.category}`);
    }
    return new Product({
      ...props,
      name: props.name.trim(),
      description: props.description?.trim() ?? ''
    });
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string { return this.props.description; }
  get price(): Money { return this.props.price; }
  get category(): ProductCategory { return this.props.category; }
  get available(): boolean { return this.props.available; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  changeAvailability(available: boolean): Product {
    return Product.create({ ...this.props, available, updatedAt: new Date() });
  }

  update(input: ProductUpdateInput): Product {
    return Product.create({
      ...this.props,
      name: input.name ?? this.props.name,
      description: input.description ?? this.props.description,
      price: input.price ?? this.props.price,
      category: input.category ?? this.props.category,
      available: input.available ?? this.props.available,
      updatedAt: new Date()
    });
  }
}
