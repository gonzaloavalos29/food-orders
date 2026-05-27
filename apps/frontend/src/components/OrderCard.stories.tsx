import type { Meta, StoryObj } from '@storybook/react';
import { OrderCard } from './OrderCard';
import type { OrderDto } from '../api/types';

const baseOrder: OrderDto = {
  id: 'abcdef0123',
  userId: 'u-1',
  status: 'PENDING',
  items: [
    { productId: 'p-1', productName: 'Pizza Muzzarella', unitPriceInCents: 600000, currency: 'ARS', quantity: 1, subtotalInCents: 600000 },
    { productId: 'p-2', productName: 'Coca-Cola 500ml', unitPriceInCents: 150000, currency: 'ARS', quantity: 2, subtotalInCents: 300000 }
  ],
  totalInCents: 900000,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const meta: Meta<typeof OrderCard> = {
  title: 'Components/OrderCard',
  component: OrderCard,
  args: { order: baseOrder }
};
export default meta;

type Story = StoryObj<typeof OrderCard>;
export const Pending: Story = {};
export const Confirmed: Story = { args: { order: { ...baseOrder, status: 'CONFIRMED' } } };
export const Preparing: Story = { args: { order: { ...baseOrder, status: 'PREPARING' } } };
export const Ready: Story = { args: { order: { ...baseOrder, status: 'READY' } } };
export const Delivered: Story = { args: { order: { ...baseOrder, status: 'DELIVERED' } } };
export const Cancelled: Story = { args: { order: { ...baseOrder, status: 'CANCELLED' } } };

export const StaffActions: Story = {
  args: { canManage: true, canCancel: true, onAdvance: () => {}, onCancel: () => {} }
};
export const CustomerCanCancel: Story = {
  args: { canCancel: true, onCancel: () => {} }
};
