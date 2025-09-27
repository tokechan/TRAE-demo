import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Button component variants and sizes
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * Reusable Button component with Apple Liquid Glass styling
 * Supports multiple variants, sizes, loading states, and icons
 * Implements frosted glass effects, smooth animations, and accessibility features
 * Follows WCAG 2.1 AA guidelines for contrast and touch targets
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  children,
  className = '',
  disabled,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  // Base button styles with glass morphism and accessibility
  const baseStyles = `
    relative inline-flex items-center justify-center
    font-medium rounded-xl transition-all duration-200
    backdrop-filter backdrop-blur-md
    border border-white/20
    focus:outline-none focus-visible
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:scale-[1.02] active:scale-[0.98]
    shadow-lg hover:shadow-xl
    min-h-[44px] min-w-[44px]
  `;

  // Variant styles with improved contrast for accessibility
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-500 to-purple-600
      text-white shadow-blue-500/25
      hover:from-blue-600 hover:to-purple-700
      hover:shadow-blue-500/40
      border-blue-400/30
    `,
    secondary: `
      bg-white/10 text-white
      hover:bg-white/20
      shadow-white/10
      border-white/30
    `,
    ghost: `
      bg-transparent text-white/90
      border-transparent
      hover:bg-white/10 hover:text-white
      shadow-none
    `,
    glass: `
      bg-white/5 text-white
      hover:bg-white/10
      shadow-white/5
      border-white/20
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600
      text-white shadow-red-500/25
      hover:from-red-600 hover:to-red-700
      hover:shadow-red-500/40
      border-red-400/30
    `
  };

  // Size styles with proper touch targets
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  const buttonClasses = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const isDisabled = disabled || loading;

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" 
            role="status"
            aria-label="Loading"
          />
        </div>
      )}
      
      <div className={cn('flex items-center space-x-2', loading && 'opacity-0')}>
        {Icon && (
          <span 
            className={cn(
              'flex-shrink-0',
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
            )}
            aria-hidden="true"
          >
            {Icon}
          </span>
        )}
        {children && <span>{children}</span>}
      </div>
    </button>
  );
};

export default Button;