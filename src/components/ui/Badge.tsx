import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Badge component with Apple Liquid Glass design
 * Features multiple variants, sizes, and smooth hover effects
 * Perfect for displaying subscription statuses and categories
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  onClick
}) => {
  // Base styles with Apple Liquid Glass effect
  const baseClasses = cn(
    'inline-flex items-center font-medium rounded-full',
    'backdrop-blur-sm border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    onClick && 'cursor-pointer hover:scale-105 active:scale-95'
  );

  // Variant styles
  const variantClasses = {
    default: 'bg-gray-100/80 text-gray-800 border-gray-200/50 hover:bg-gray-200/80 focus:ring-gray-500',
    success: 'bg-green-100/80 text-green-800 border-green-200/50 hover:bg-green-200/80 focus:ring-green-500',
    warning: 'bg-yellow-100/80 text-yellow-800 border-yellow-200/50 hover:bg-yellow-200/80 focus:ring-yellow-500',
    error: 'bg-red-100/80 text-red-800 border-red-200/50 hover:bg-red-200/80 focus:ring-red-500',
    info: 'bg-blue-100/80 text-blue-800 border-blue-200/50 hover:bg-blue-200/80 focus:ring-blue-500',
    outline: 'bg-white/80 text-gray-700 border-gray-300/50 hover:bg-gray-50/80 focus:ring-gray-500'
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};

// Status badge for subscriptions
interface StatusBadgeProps {
  status: 'active' | 'cancelled' | 'paused' | 'expired' | 'trial';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'アクティブ' },
    cancelled: { variant: 'error' as const, label: 'キャンセル済み' },
    paused: { variant: 'warning' as const, label: '一時停止' },
    expired: { variant: 'error' as const, label: '期限切れ' },
    trial: { variant: 'info' as const, label: 'トライアル' }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

// Category badge for subscription categories
interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className }) => {
  // Map categories to colors
  const getCategoryVariant = (cat: string): BadgeProps['variant'] => {
    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes('entertainment') || lowerCat.includes('エンターテイメント')) return 'info';
    if (lowerCat.includes('productivity') || lowerCat.includes('生産性')) return 'success';
    if (lowerCat.includes('health') || lowerCat.includes('健康')) return 'success';
    if (lowerCat.includes('finance') || lowerCat.includes('金融')) return 'warning';
    if (lowerCat.includes('education') || lowerCat.includes('教育')) return 'info';
    return 'outline';
  };

  return (
    <Badge variant={getCategoryVariant(category)} size="sm" className={className}>
      {category}
    </Badge>
  );
};

// Price badge for displaying costs
interface PriceBadgeProps {
  amount: number;
  currency?: string;
  period?: 'month' | 'year' | 'week' | 'day';
  className?: string;
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({
  amount,
  currency = 'JPY',
  period = 'month',
  className
}) => {
  const formatAmount = (amt: number, curr: string) => {
    if (curr === 'JPY') {
      return `¥${amt.toLocaleString()}`;
    }
    return `$${amt.toFixed(2)}`;
  };

  const periodLabels = {
    month: '/月',
    year: '/年',
    week: '/週',
    day: '/日'
  };

  return (
    <Badge variant="outline" className={cn('font-mono', className)}>
      {formatAmount(amount, currency)}{periodLabels[period]}
    </Badge>
  );
};

export default Badge;