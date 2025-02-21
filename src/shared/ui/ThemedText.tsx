import React from "react";
import { cn } from "@/shared/lib/utils";

type TextVariant = "h1" | "h2" | "h3" | "subtitle1" | "body1" | "caption";

interface ThemedTextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: keyof React.ReactHTML;
}

const variantStyles: Record<TextVariant, string> = {
  h1: "text-4xl font-bold text-primary",
  h2: "text-3xl font-semibold text-primary",
  h3: "text-2xl font-medium text-primary",
  subtitle1: "text-xl text-secondary",
  body1: "text-base text-foreground",
  caption: "text-sm text-muted",
};

export const ThemedText: React.FC<ThemedTextProps> = ({
  variant = "body1",
  as,
  className,
  children,
  ...props
}) => {
  const Component = as || (variant.startsWith("h") ? variant : "p");

  return React.createElement(
    Component as keyof React.ReactHTML,
    {
      className: cn(variantStyles[variant], className),
      ...props,
    },
    children
  );
};
