import { Money } from '../value-objects';
import { ValidationError } from '../errors';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: Money;
  quantity: number;
}

export interface OrderProps {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: []
};

export class Order {
  private constructor(private readonly props: OrderProps) {}

  static create(props: OrderProps): Order {
    if (!props.id || props.id.trim().length === 0) {
      throw new ValidationError('Order id is required');
    }
    if (!props.userId || props.userId.trim().length === 0) {
      throw new ValidationError('Order userId is required');
    }
    if (!props.items || props.items.length === 0) {
      throw new ValidationError('Order must have at least one item');
    }
    for (const item of props.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new ValidationError(`Invalid quantity for item ${item.productId}`);
      }
    }
    return new Order({ ...props, items: props.items.map(i => ({ ...i })) });
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get items(): ReadonlyArray<OrderItem> { return this.props.items; }
  get status(): OrderStatus { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  get total(): Money {
    return this.props.items.reduce(
      (acc, item) => acc.add(item.unitPrice.multiply(item.quantity)),
      Money.zero(this.props.items[0].unitPrice.currency)
    );
  }

  transitionTo(next: OrderStatus): Order {
    const allowed = ALLOWED_TRANSITIONS[this.props.status];
    if (!allowed.includes(next)) {
      throw new ValidationError(
        `Cannot transition order from ${this.props.status} to ${next}`
      );
    }
    return new Order({ ...this.props, status: next, updatedAt: new Date() });
  }

  canBeCancelledByCustomer(): boolean {
    return this.props.status === 'PENDING' || this.props.status === 'CONFIRMED';
  }
}
