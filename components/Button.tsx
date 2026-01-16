import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = 'primary', isLoading = false, fullWidth = false, className = '', disabled, ...props }, ref) => {
        const baseStyles = `
      px-6 py-3 
      font-semibold 
      text-sm 
      uppercase 
      tracking-wide
      transition-all duration-150
      disabled:opacity-50 disabled:cursor-not-allowed
      relative
      overflow-hidden
    `;

        const variantStyles = {
            primary: `
        bg-bulk-accent 
        text-bulk-bg 
        hover:bg-[#16a980]
        border border-bulk-accent
        hover:border-[#16a980]
      `,
            secondary: `
        bg-transparent 
        text-bulk-text 
        border border-bulk-border
        hover:border-bulk-muted
      `,
        };

        const widthStyles = fullWidth ? 'w-full' : '';

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
                {...props}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </span>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
