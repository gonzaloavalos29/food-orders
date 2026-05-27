import type { Meta, StoryObj } from '@storybook/react';
import { Money } from './Money';

const meta: Meta<typeof Money> = {
  title: 'Components/Money',
  component: Money
};
export default meta;

type Story = StoryObj<typeof Money>;
export const ArsPrice: Story = { args: { amountInCents: 599900, currency: 'ARS' } };
export const Zero: Story = { args: { amountInCents: 0 } };
export const Usd: Story = { args: { amountInCents: 1299, currency: 'USD' } };
