import type { Meta, StoryObj } from '@stencil/storybook-plugin';
import { h } from '@stencil/core';
import { SsButton } from './ss-button';

const meta:Meta<SsButton> = {
  title: 'SS Button',
  component: SsButton,
  parameters: {
    layout: 'centered',
    actions: {
      handles: ['ssClick'],
    },
  },
  argTypes: {
    xid: {
      control: 'text',
      description: 'ID del botón'
    },
    label: {
      control: 'text',
      description: 'Texto del botón'
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Tipo de botón'
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado'
    },
    oneClick: {
      control: 'boolean',
      description: 'Un solo clic'
    },
    disableDuration: {
      control: 'number',
      description: 'Duración de la deshabilitación'
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Tamaño del botón'
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'quaternary', 'success', 'warning', 'error', 'info'],
      description: 'Variantes de color'
    },
    xStyle: {
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
      description: 'Estilo del botón'
    },
    shape: {
      control: 'select',
      options: ['rounded', 'pill', 'circle', 'square'],
      description: 'Forma del botón'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Ancho completo'
    },
    status: {
      control: 'select',
      options: ['active', 'disabled', 'loading'],
      description: 'Estado inicial del botón'
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right', 'only'],
      description: 'Posición del icono'
    },
  },
  args: {
    label: 'Click me',
    variant: 'primary',
    size: 'md',
    status: 'active',
    iconPosition: 'right',
  },
}

export default meta;

type Story = StoryObj<SsButton>;

export const Primary: Story = {
  args: {
    label: 'Click me',
    xid: 'story-primary',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
    xStyle: 'solid',
    xid: 'story-secondary',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Outline: Story = {
  args: {
    label: 'Outline Button',
    variant: 'primary',
    xStyle: 'outline',
    xid: 'story-outline',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Ghost: Story = {
  args: {
    label: 'Ghost Button',
    variant: 'primary',
    xStyle: 'ghost',
    xid: 'story-ghost',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Small: Story = {
  args: {
    label: 'Small Button',
    size: 'sm',
    xid: 'story-small',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Large: Story = {
  args: {
    label: 'Large Button',
    size: 'lg',
    xid: 'story-large',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Button',
    fullWidth: true,
    xid: 'story-full-width',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Button',
    disabled: true,
    xid: 'story-disabled',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Loading: Story = {
  args: {
    label: 'Loading Button',
    status: 'loading',
    xid: 'story-loading',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Success: Story = {
  args: {
    label: 'Success Button',
    variant: 'success',
    xid: 'story-success',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Error: Story = {
  args: {
    label: 'Error Button',
    variant: 'error',
    xid: 'story-error',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Warning: Story = {
  args: {
    label: 'Warning Button',
    variant: 'warning',
    xid: 'story-warning',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const Info: Story = {
  args: {
    label: 'Info Button',
    variant: 'info',
    xid: 'story-info',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const PillShape: Story = {
  args: {
    label: 'Pill Button',
    shape: 'pill',
    xid: 'story-pill',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const CircleShape: Story = {
  args: {
    label: '🔔',
    shape: 'circle',
    iconPosition: 'only',
    xid: 'story-circle',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};

export const OneClickButton: Story = {
  args: {
    label: 'One Click Only',
    oneClick: true,
    disableDuration: 3000,
    xid: 'story-one-click',
  },
  render: (props) => (
    <ss-button
      {...props}
      onSsClick={(e) => console.log('ssClick event:', e.detail)}
    />
  ),
};



