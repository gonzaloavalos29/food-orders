import { Money } from '../value-objects';
import { ValidationError } from '../errors';
import { Product } from './product';

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: Money;
  quantity: number;
}

export class Cart {
  private constructor(
    public readonly userId: string,
    private readonly _items: CartItem[]
  ) {}

  static empty(userId: string): Cart {
    if (!userId || userId.trim().length === 0) {
      throw new ValidationError('Cart userId is required');
    }
    return new Cart(userId, []);
  }

  static restore(userId: string, items: CartItem[]): Cart {
    return new Cart(userId, items.map(i => ({ ...i })));
  }

  get items(): ReadonlyArray<CartItem> {
    return this._items;
  }

  isEmpty(): boolean {
    return this._items.length === 0;
  }

  addItem(product: Product, quantity: number): Cart {
    Cart.assertPositiveQuantity(quantity);
    if (!product.available) {
      throw new ValidationError(`Product ${product.id} is not available`);
    }
    const existing = this._items.find(i => i.productId === product.id);
    let newItems: CartItem[];
    if (existing) {
      newItems = this._items.map(i =>
        i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      newItems = [
        ...this._items,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity
        }
      ];
    }
    return new Cart(this.userId, newItems);
  }

  removeItem(productId: string): Cart {
    return new Cart(
      this.userId,
      this._items.filter(i => i.productId !== productId)
    );
  }

  updateQuantity(productId: string, quantity: number): Cart {
    if (quantity < 0 || !Number.isInteger(quantity)) {
      throw new ValidationError('Quantity must be a non-negative integer');
    }
    if (quantity === 0) {
      return this.removeItem(productId);
    }
    const exists = this._items.some(i => i.productId === productId);
    if (!exists) {
      throw new ValidationError(`Item ${productId} not in cart`);
    }
    const newItems = this._items.map(i =>
      i.productId === productId ? { ...i, quantity } : i
    );
    return new Cart(this.userId, newItems);
  }

  clear(): Cart {
    return new Cart(this.userId, []);
  }

  total(): Money {
    if (this._items.length === 0) {
      return Money.zero();
    }
    return this._items.reduce(
      (acc, item) => acc.add(item.unitPrice.multiply(item.quantity)),
      Money.zero(this._items[0].unitPrice.currency)
    );
  }

  private static assertPositiveQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError('Quantity must be a positive integer');
    }
  }
}
