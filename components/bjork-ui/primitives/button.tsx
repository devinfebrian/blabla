"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { useWebHaptics } from "web-haptics/react";
import type { HapticInput, TriggerOptions } from "web-haptics";
import { cn } from "@/lib/utils";

const bjorkButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[3px] text-[0.75rem] font-medium tracking-[0.015em] uppercase outline-none transition-colors duration-150 ease-out focus-visible:ring-1 focus-visible:ring-[color:var(--bjork-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bjork-ring-offset)] disabled:pointer-events-none disabled:opacity-35 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-primary text-primary-foreground hover:bg-primary/85",
        secondary:
          "border border-border bg-[var(--bjork-surface-active)] text-[color:var(--bjork-text)] hover:bg-[var(--bjork-surface-hover)]",
        outline:
          "border border-foreground bg-transparent text-[color:var(--bjork-text-strong)] hover:bg-[var(--bjork-surface-hover)]",
        ghost:
          "border border-transparent bg-transparent text-[color:var(--bjork-text-muted)] hover:bg-[var(--bjork-surface-hover)] hover:text-[color:var(--bjork-text)]",
        quiet:
          "border border-transparent bg-[var(--bjork-field-muted)] text-[color:var(--bjork-text-soft)] hover:bg-[var(--bjork-surface-hover)]",
      },
      size: {
        sm: "h-9 px-3 text-[0.7rem] has-[>svg:first-child]:pl-2.5 has-[>svg:last-child]:pr-2.5",
        md: "h-11 px-4 has-[>svg:first-child]:pl-3.5 has-[>svg:last-child]:pr-3.5",
        lg: "h-12 px-5 text-[0.8rem] has-[>svg:first-child]:pl-4.5 has-[>svg:last-child]:pr-4.5",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BjorkButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "size">,
    VariantProps<typeof bjorkButtonVariants> {
  haptics?: boolean;
  hapticPattern?: HapticInput;
  hapticOptions?: TriggerOptions;
}

export function BjorkButton({
  className,
  variant,
  size,
  disabled,
  haptics = true,
  hapticPattern = "light",
  hapticOptions,
  onPointerDown,
  tabIndex,
  ...props
}: BjorkButtonProps) {
  const { trigger } = useWebHaptics();

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!disabled && haptics) {
        void trigger(hapticPattern, hapticOptions);
      }

      onPointerDown?.(event);
    },
    [disabled, hapticOptions, hapticPattern, haptics, onPointerDown, trigger],
  );

  return (
    <motion.button
      data-slot="bjork-button"
      className={cn(bjorkButtonVariants({ variant, size, className }))}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      tabIndex={tabIndex ?? 0}
      {...props}
    />
  );
}

export { bjorkButtonVariants };
