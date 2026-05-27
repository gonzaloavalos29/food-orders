import { ValidationError } from '../errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    if (typeof raw !== 'string') {
      throw new ValidationError('Email must be a string');
    }
    const normalized = raw.trim().toLowerCase();
    if (normalized.length === 0) {
      throw new ValidationError('Email cannot be empty');
    }
    if (!EMAIL_REGEX.test(normalized)) {
      throw new ValidationError(`Invalid email format: ${raw}`);
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
