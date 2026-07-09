import { Email } from './email';
import { ValidationError } from '../errors';

describe('Email', () => {
  it('creates a valid email', () => {
    const email = Email.create('user@example.com');
    expect(email.value).toBe('user@example.com');
  });

  it('lowercases the email', () => {
    const email = Email.create('User@Example.COM');
    expect(email.value).toBe('user@example.com');
  });

  it('trims surrounding whitespace', () => {
    const email = Email.create('  user@example.com  ');
    expect(email.value).toBe('user@example.com');
  });

  it('rejects empty input', () => {
    expect(() => Email.create('')).toThrow(ValidationError);
  });

  it('rejects emails without "@"', () => {
    expect(() => Email.create('userexample.com')).toThrow(ValidationError);
  });

  it('rejects emails without domain', () => {
    expect(() => Email.create('user@')).toThrow(ValidationError);
  });

  it('considers two equal emails equal', () => {
    expect(Email.create('a@b.com').equals(Email.create('A@B.COM'))).toBe(true);
  });

  it('rejects a non-string input', () => {
    expect(() => Email.create(123 as unknown as string)).toThrow(ValidationError);
  });

  it('toString() returns the normalized value', () => {
    expect(Email.create('User@Example.com').toString()).toBe('user@example.com');
  });
});
