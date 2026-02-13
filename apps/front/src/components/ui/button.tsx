import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { GlassFilter } from "./filters/glass-filter";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 ",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "relative text-white font-semibold inline-flex rounded-full border border-white/30 bg-gradient-to-br from-white/20 via-white/8 to-white/5 [backdrop-filter:url(#glass)] hover:scale-101",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        xl: "h-11 px-7 has-[>svg]:px-5",
        "2xl":
          "sm:h-13 sm:px-8 px-6 h-10 text-[15px] has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-5 gap-4",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        "icon-2xl": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
      color: {
        blue: "bg-blue-600 hover:bg-blue-700",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        color: "blue",
        className: "bg-blue-600 text-white hover:bg-blue-700",
      },
      {
        variant: "outline",
        color: "blue",
        className:
          "border-blue-600 text-blue-600 bg-transparent hover:text-blue-600 hover:bg-blue-50",
      },
      {
        variant: "secondary",
        color: "blue",
        className:
          "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900",
      },
      {
        variant: "ghost",
        color: "blue",
        className: "hover:text-blue-600 hover:bg-blue-50 bg-transparent",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className, color }))}
      {...props}
    >
      <GlassFilter>{props.children}</GlassFilter>
    </Comp>
  );
}

export { Button, buttonVariants };
