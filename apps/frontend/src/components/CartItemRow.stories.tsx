import type { Meta, StoryObj } from '@storybook/react';
import { CartItemRow } from './CartItemRow';

const meta: Meta<typeof CartItemRow> = {
  title: 'Components/CartItemRow',
  component: CartItemRow,
  args: {
    item: {
      productId: 'p-1',
      productName: 'Pizza Muzzarella',
      unitPriceInCents: 600000,
      currency: 'ARS',
      quantity: 2,
      subtotalInCents: 1200000
    },
    onQuantityChange: () => {},
    onRemove: () => {}
  }
};
export default meta;

type Story = StoryObj<typeof CartItemRow>;
export const Editable: Story = {};
export const ReadOnly: Story = { args: { onQuantityChange: undefined, onRemove: undefined } };
