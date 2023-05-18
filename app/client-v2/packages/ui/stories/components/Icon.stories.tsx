import type { Meta, StoryObj } from "@storybook/react";

import { ThemeProvider } from "../theme";
import { Icon } from "../theme";

const meta: Meta<typeof Icon> = {
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    iconId: {
      options: ["help", "home"],
      control: { type: "radio" },
    },
    className: {
      control: false,
    },
    size: {
      options: ["extra small", "small", "medium", "large", "default"],
      control: {
        type: "select",
      },
    },
  },
  args: {
    iconId: "help",
    size: "medium",
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    iconId: "help",
    size: "default",
  },
};

export const ExtraSmall: Story = {
  args: {
    iconId: "help",
    size: "extra small",
  },
};

export const Small: Story = {
  args: {
    iconId: "help",
    size: "small",
  },
};

export const Medium: Story = {
  args: {
    iconId: "help",
    size: "medium",
  },
};

export const Large: Story = {
  args: {
    iconId: "help",
    size: "large",
  },
};
