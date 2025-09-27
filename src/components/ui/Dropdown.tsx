import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Dropdown component with Apple Liquid Glass design
 * Features smooth animations, keyboard navigation, and accessibility support
 * Perfect for menus, select lists, and action dropdowns
 */

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = '選択してください',
  onSelect,
  disabled = false,
  className,
  size = 'md',
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0) {
          const option = options[focusedIndex];
          if (!option.disabled) {
            onSelect(option.value);
            setIsOpen(false);
            setFocusedIndex(-1);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const nextIndex = Math.min(focusedIndex + 1, options.length - 1);
          setFocusedIndex(nextIndex);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          const prevIndex = Math.max(focusedIndex - 1, 0);
          setFocusedIndex(prevIndex);
        }
        break;
    }
  };

  const selectedOption = options.find(option => option.value === value);

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]'
  };

  // Variant styles
  const variantClasses = {
    default: 'bg-white/80 border-gray-300/50 hover:bg-white/90 focus:ring-blue-500 focus:border-blue-500',
    outline: 'bg-transparent border-gray-300/50 hover:bg-gray-50/50 focus:ring-blue-500 focus:border-blue-500',
    ghost: 'bg-transparent border-transparent hover:bg-gray-100/50 focus:ring-blue-500 focus:bg-white/50'
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'w-full flex items-center justify-between',
          'backdrop-blur-xl border rounded-lg',
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-blue-500 border-blue-500'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="dropdown-label"
      >
        <span className="flex items-center space-x-2 truncate">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className={cn(
            'truncate',
            !selectedOption && 'text-gray-500'
          )}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 w-full mt-1',
            'bg-white/90 backdrop-blur-xl border border-gray-200/50',
            'rounded-lg shadow-lg shadow-black/10',
            'animate-in fade-in-0 zoom-in-95 duration-200'
          )}
          role="listbox"
          aria-labelledby="dropdown-label"
        >
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2 text-left',
                  'transition-colors duration-150',
                  'hover:bg-gray-100/50 focus:bg-gray-100/50 focus:outline-none',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  focusedIndex === index && 'bg-gray-100/50',
                  value === option.value && 'bg-blue-50/50 text-blue-700'
                )}
                onClick={() => {
                  if (!option.disabled) {
                    onSelect(option.value);
                    setIsOpen(false);
                    setFocusedIndex(-1);
                  }
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                disabled={option.disabled}
                role="option"
                aria-selected={value === option.value}
              >
                <span className="flex items-center space-x-2">
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
                  <span>{option.label}</span>
                </span>
                {value === option.value && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Menu dropdown for actions
interface MenuDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  trigger,
  children,
  align = 'left',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0'
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 min-w-[200px]',
            'bg-white/90 backdrop-blur-xl border border-gray-200/50',
            'rounded-lg shadow-lg shadow-black/10',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            alignClasses[align]
          )}
        >
          <div className="py-1" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Menu item component
interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  children,
  onClick,
  disabled = false,
  destructive = false,
  className
}) => {
  return (
    <button
      type="button"
      className={cn(
        'w-full flex items-center px-4 py-2 text-left text-sm',
        'transition-colors duration-150',
        'hover:bg-gray-100/50 focus:bg-gray-100/50 focus:outline-none',
        disabled && 'opacity-50 cursor-not-allowed',
        destructive && 'text-red-600 hover:bg-red-50/50',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Dropdown;