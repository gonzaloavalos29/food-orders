import { v4 as uuidv4 } from 'uuid';
import { IdGenerator } from '@food-orders/domain';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}
