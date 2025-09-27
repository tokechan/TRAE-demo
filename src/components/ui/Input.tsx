import React, { useId } from 'react';
import { cn } from '../../lib/utils';

/**
 * Input component variants and sizes
 */
type InputVariant = 'default' | 'glass' | 'outlined';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  inputSize?: InputSize;
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * Reusable Input component with Apple Liquid Glass styling
 * Supports multiple variants, sizes, labels, icons, and error states
 * Implements frosted glass effects, smooth animations, and accessibility features
 * Follows WCAG 2.1 AA guidelines for contrast and touch targets
 */
export const Input: React.FC<InputProps> = ({
  variant = 'default',
  inputSize = 'md',
  label,
  icon: Icon,
  error,
  helperText,
  className = '',
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Base input styles with glass morphism and accessibility
  const baseStyles = `
    w-full rounded-xl border transition-all duration-200
    backdrop-filter backdrop-blur-md
    focus:outline-none focus-visible
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-white/40
    min-h-[44px]
  `;

  // Variant styles with improved contrast
  const variantStyles = {
    default: `
      bg-white/10 border-white/20 text-white
      focus:border-white/40 focus:bg-white/15
    `,
    glass: `
      bg-white/5 border-white/10 text-white
      focus:border-white/30 focus:bg-white/10
    `,
    outlined: `
      bg-transparent border-white/30 text-white
      focus:border-white/50 focus:bg-white/5
    `
  };

  // Size styles with proper touch targets
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-4 py-3 text-base min-h-[48px]'
  };

  // Error styles
  const errorStyles = error ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/50' : '';

  const inputClasses = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[inputSize],
    errorStyles,
    Icon ? 'pl-10' : '',
    className
  );

  const errorId = error ? `${inputId}-error` : undefined;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [
    ariaDescribedBy,
    errorId,
    helperTextId
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-white mb-2"
        >
          {label}
          {props.required && (
            <span className="text-red-400 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">
            {Icon}
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          className={inputClasses}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : 'false'}
          aria-label={ariaLabel}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p 
          id={errorId}
          className="mt-1 text-sm text-red-400 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p 
          id={helperTextId}
          className="mt-1 text-sm text-white/60"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

Input.displayName = 'Input';

export default Input;