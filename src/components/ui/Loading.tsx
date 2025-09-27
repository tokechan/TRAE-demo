import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Loading component with Apple Liquid Glass design
 * Features multiple variants, sizes, and smooth animations
 * Includes accessibility support with proper ARIA attributes
 */

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  className,
  fullScreen = false
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Spinner component
  const Spinner = () => (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300/30',
        'border-t-blue-600 border-r-blue-600',
        sizeClasses[size]
      )}
      role="status"
      aria-label="読み込み中"
    />
  );

  // Dots component
  const Dots = () => (
    <div className="flex space-x-1" role="status" aria-label="読み込み中">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-blue-600 rounded-full animate-pulse',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );

  // Pulse component
  const Pulse = () => (
    <div
      className={cn(
        'bg-blue-600 rounded-full animate-ping',
        sizeClasses[size]
      )}
      role="status"
      aria-label="読み込み中"
    />
  );

  // Skeleton component
  const Skeleton = () => (
    <div className="animate-pulse space-y-3" role="status" aria-label="読み込み中">
      <div className="h-4 bg-gray-300/50 rounded-lg w-3/4" />
      <div className="h-4 bg-gray-300/50 rounded-lg w-1/2" />
      <div className="h-4 bg-gray-300/50 rounded-lg w-5/6" />
    </div>
  );

  // Render loading variant
  const renderLoadingVariant = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      case 'skeleton':
        return <Skeleton />;
      default:
        return <Spinner />;
    }
  };

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-3',
        fullScreen && 'min-h-screen',
        className
      )}
    >
      {renderLoadingVariant()}
      {text && (
        <p className={cn('text-gray-600 font-medium', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  variant?: LoadingProps['variant'];
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = '読み込み中...',
  variant = 'spinner',
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg">
            <Loading variant={variant} text={text} />
          </div>
        </div>
      )}
    </div>
  );
};

// Loading button component
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loading
          variant="spinner"
          size={size === 'lg' ? 'md' : 'sm'}
          className="mr-2"
        />
      )}
      {isLoading ? loadingText || '処理中...' : children}
    </button>
  );
};

export default Loading;