import { IdGenerator } from '../services';

export class CounterIdGenerator implements IdGenerator {
  private counter = 0;
  constructor(private readonly prefix = 'id') {}
  generate(): string {
    this.counter += 1;
    return `${this.prefix}-${this.counter}`;
  }
}
