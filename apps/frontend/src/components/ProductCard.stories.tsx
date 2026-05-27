import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';
import type { ProductDto } from '../api/types';

const baseProduct: ProductDto = {
  id: 'p-1',
  name: 'Pizza Muzzarella',
  description: 'Salsa, muzzarella y aceitunas',
  priceInCents: 600000,
  currency: 'ARS',
  category: 'PIZZA',
  available: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  args: { product: baseProduct, onAdd: () => {} }
};
export default meta;

type Story = StoryObj<typeof ProductCard>;
export const Pizza: Story = {};
export const Burger: Story = {
  args: {
    product: { ...baseProduct, name: 'Hamburguesa Doble', category: 'BURGER', priceInCents: 550000 }
  }
};
export const Drink: Story = {
  args: {
    product: { ...baseProduct, name: 'Coca-Cola 500ml', category: 'DRINK', priceInCents: 150000, description: 'Botella' }
  }
};
export const Unavailable: Story = {
  args: { product: { ...baseProduct, available: false } }
};
export const ReadOnly: Story = {
  args: { onAdd: undefined }
};
