import { ValidationError } from '../errors';

export type Currency = 'ARS' | 'USD';

export class Money {
  private constructor(
    public readonly amountInCents: number,
    public readonly currency: Currency
  ) {}

  static fromCents(amountInCents: number, currency: Currency = 'ARS'): Money {
    if (!Number.isInteger(amountInCents)) {
      throw new ValidationError('Money amount must be an integer number of cents');
    }
    if (amountInCents < 0) {
      throw new ValidationError('Money amount cannot be negative');
    }
    return new Money(amountInCents, currency);
  }

  static fromUnits(units: number, currency: Currency = 'ARS'): Money {
    return Money.fromCents(Math.round(units * 100), currency);
  }

  static zero(currency: Currency = 'ARS'): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountInCents + other.amountInCents, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amountInCents - other.amountInCents;
    if (result < 0) {
      throw new ValidationError('Money subtraction would result in negative amount');
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    if (!Number.isInteger(factor) || factor < 0) {
      throw new ValidationError('Multiplier must be a non-negative integer');
    }
    return new Money(this.amountInCents * factor, this.currency);
  }

  equals(other: Money): boolean {
    return (
      this.amountInCents === other.amountInCents &&
      this.currency === other.currency
    );
  }

  toString(): string {
    return `${(this.amountInCents / 100).toFixed(2)} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new ValidationError(
        `Cannot operate on different currencies: ${this.currency} vs ${other.currency}`
      );
    }
  }
}
