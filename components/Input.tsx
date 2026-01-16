import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs uppercase tracking-wide text-bulk-muted mb-2 font-medium">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            w-full px-4 py-3 
            bg-bulk-panel 
            border border-bulk-border 
            text-bulk-text 
            placeholder:text-bulk-muted
            focus:outline-none 
            focus:border-bulk-accent 
            transition-all duration-150
            font-medium
            ${error ? 'border-bulk-error' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-bulk-error mt-2 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
