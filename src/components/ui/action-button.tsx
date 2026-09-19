import * as React from "react";
import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | null;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      href,
      icon: Icon = Plus,
      iconPosition = "left",
      variant = "primary",
      size = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variantStyles = {
      primary: "btn-cta bg-primary text-primary-foreground shadow-sm hover:opacity-95 hover:shadow-md",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent hover:text-primary",
      ghost: "text-foreground hover:bg-accent hover:text-primary",
      white: "bg-white text-ink hover:bg-white/90 shadow-sm",
    };

    const sizeStyles = {
      sm: "h-9 px-4 text-xs gap-1.5",
      md: "h-10 px-5 text-sm gap-2",
      lg: "h-12 px-7 text-base gap-2.5",
    };

    const iconSizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

    const content = (
      <>
        {Icon && iconPosition === "left" && <Icon className={cn("shrink-0", iconSizeClass)} aria-hidden="true" />}
        {children && <span>{children}</span>}
        {Icon && iconPosition === "right" && <Icon className={cn("shrink-0", iconSizeClass)} aria-hidden="true" />}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={cn(combinedClassName(baseStyles, variantStyles[variant], sizeStyles[size], className))}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props}>
        {content}
      </button>
    );
  }
);

function combinedClassName(...classes: (string | undefined)[]) {
  return cn(...classes);
}

ActionButton.displayName = "ActionButton";
