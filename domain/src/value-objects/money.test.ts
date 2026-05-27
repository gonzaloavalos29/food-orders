import { Money } from './money';
import { ValidationError } from '../errors';

describe('Money', () => {
  describe('creation', () => {
    it('creates Money in ARS by default with whole units', () => {
      const m = Money.fromUnits(10);
      expect(m.amountInCents).toBe(1000);
      expect(m.currency).toBe('ARS');
    });

    it('creates Money from cents', () => {
      const m = Money.fromCents(1599);
      expect(m.amountInCents).toBe(1599);
    });

    it('rejects negative amounts', () => {
      expect(() => Money.fromCents(-1)).toThrow(ValidationError);
    });

    it('allows zero', () => {
      const m = Money.zero();
      expect(m.amountInCents).toBe(0);
    });

    it('rejects non-integer cents', () => {
      expect(() => Money.fromCents(1.5)).toThrow(ValidationError);
    });
  });

  describe('arithmetic', () => {
    it('adds two amounts of the same currency', () => {
      const total = Money.fromCents(500).add(Money.fromCents(300));
      expect(total.amountInCents).toBe(800);
    });

    it('rejects adding different currencies', () => {
      const a = Money.fromCents(100, 'ARS');
      const b = Money.fromCents(100, 'USD');
      expect(() => a.add(b)).toThrow(ValidationError);
    });

    it('multiplies by an integer factor', () => {
      const m = Money.fromCents(250).multiply(3);
      expect(m.amountInCents).toBe(750);
    });

    it('rejects negative multiplier', () => {
      expect(() => Money.fromCents(100).multiply(-1)).toThrow(ValidationError);
    });
  });

  describe('equality', () => {
    it('two Money with same amount and currency are equal', () => {
      expect(Money.fromCents(100).equals(Money.fromCents(100))).toBe(true);
    });

    it('different currencies are not equal', () => {
      expect(
        Money.fromCents(100, 'ARS').equals(Money.fromCents(100, 'USD'))
      ).toBe(false);
    });
  });
});
