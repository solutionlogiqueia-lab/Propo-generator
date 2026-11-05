import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sl-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "sl-gradient text-white hover:opacity-90",
        solid: "bg-sl-primary text-white hover:opacity-90",
        outline: "border border-sl-line bg-white text-sl-text hover:bg-sl-soft",
        ghost: "text-sl-muted hover:bg-sl-soft hover:text-sl-text",
        danger: "border border-sl-line bg-white text-sl-warn hover:bg-sl-soft",
      },
      size: { sm: "h-9 px-3 sm:h-8", md: "h-10 px-4", icon: "h-10 w-10 sm:h-8 sm:w-8" },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>
>(({ className, variant, size, ...p }, ref) => (
  <button ref={ref} className={cn(button({ variant, size }), className)} {...p} />
));
Button.displayName = "Button";
