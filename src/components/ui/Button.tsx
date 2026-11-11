import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "secondary", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-variant={variant}
        aria-busy={isLoading}
        disabled={disabled || isLoading}
        className={`moderator-button inline-flex items-center justify-center gap-2 select-none ${className}`}
        {...props}
      >
        {isLoading && (
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
