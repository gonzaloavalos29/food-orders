import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Confirmar' },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] }
  }
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Cancelar' } };
export const Disabled: Story = { args: { disabled: true } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button {...args} size="sm">Chico</Button>
      <Button {...args} size="md">Medio</Button>
      <Button {...args} size="lg">Grande</Button>
    </div>
  )
};
