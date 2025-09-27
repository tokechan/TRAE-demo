import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Card Component with Apple Liquid Glass Design
 * 
 * A versatile card component featuring frosted glass effects, smooth animations,
 * and multiple variants for different use cases. Includes sub-components for
 * structured content layout. Follows WCAG 2.1 AA guidelines for accessibility.
 */

/**
 * Card component variants following Apple Liquid Glass design
 */
export type CardVariant = 'default' | 'glass' | 'elevated' | 'outlined';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  children: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Main Card component with Apple Liquid Glass styling
 * Provides frosted glass effect with smooth animations
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = true,
  children,
  className,
  ...props
}) => {
  // Base card styles with glass morphism and accessibility
  const baseStyles = `
    rounded-2xl backdrop-filter backdrop-blur-md transition-all duration-300
    border border-white/20 shadow-lg hover:shadow-xl
    transform hover:scale-[1.02] active:scale-[0.98]
    focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:ring-offset-2 focus-within:ring-offset-transparent
    min-h-[44px]
  `;

  // Variant styles with improved contrast
  const variantStyles = {
    default: `
      bg-white/10 hover:bg-white/15
      border-white/20 hover:border-white/30
    `,
    glass: `
      bg-white/5 hover:bg-white/10
      border-white/10 hover:border-white/20
    `,
    elevated: `
      bg-white/15 hover:bg-white/20
      border-white/30 hover:border-white/40
      shadow-2xl hover:shadow-3xl
    `,
    outlined: `
      bg-transparent hover:bg-white/5
      border-white/40 hover:border-white/60
    `
  };

  const cardClasses = cn(
    baseStyles,
    variantStyles[variant],
    className
  );

  return (
    <div
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header component for titles and actions
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 p-6 pb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Content component for main content area
 */
export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'p-6 pt-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Footer component for actions and additional info
 */
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center p-6 pt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Title component with proper typography
 */
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={cn(
        'text-heading font-semibold leading-none tracking-tight text-white',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * Card Description component with muted styling
 */
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn(
        'text-body text-white/70',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

export default Card;