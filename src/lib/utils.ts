/**
 * Utility functions for the subscription management application
 */

/**
 * Format currency amount with proper locale and currency symbol
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @param locale - The locale for formatting (defaults to 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format date to a readable string
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date to relative time (e.g., "2 days ago", "in 3 days")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Tomorrow';
    } else if (diffInDays === -1) {
      return 'Yesterday';
    } else if (diffInDays > 0) {
      return `In ${diffInDays} days`;
    } else {
      return `${Math.abs(diffInDays)} days ago`;
    }
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Calculate days until next billing date
 * @param nextBillingDate - The next billing date
 * @returns Number of days until billing
 */
export const getDaysUntilNextBilling = (nextBillingDate: string | Date): number => {
  try {
    const billingDate = typeof nextBillingDate === 'string' ? new Date(nextBillingDate) : nextBillingDate;
    const today = new Date();
    const diffInMs = billingDate.getTime() - today.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

/**
 * Calculate annual cost from monthly amount
 * @param monthlyAmount - Monthly subscription amount
 * @param billingCycle - Billing cycle ('monthly', 'yearly', 'weekly')
 * @returns Annual cost
 */
export const calculateAnnualCost = (
  monthlyAmount: number,
  billingCycle: string = 'monthly'
): number => {
  switch (billingCycle.toLowerCase()) {
    case 'yearly':
    case 'annual':
      return monthlyAmount;
    case 'monthly':
      return monthlyAmount * 12;
    case 'weekly':
      return monthlyAmount * 52;
    case 'daily':
      return monthlyAmount * 365;
    default:
      return monthlyAmount * 12;
  }
};

/**
 * Generate a random ID for new subscriptions
 * @param prefix - Optional prefix for the ID
 * @returns Random ID string
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
};

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param password - Password string to validate
 * @returns Object with validation result and requirements
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
} => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValid = Object.values(requirements).every(Boolean);

  return { isValid, requirements };
};

/**
 * Debounce function to limit function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to limit function calls
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
};

/**
 * Convert subscription category to display name
 * @param category - Category string
 * @returns Formatted category name
 */
export const formatCategory = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get color for subscription category
 * @param category - Subscription category
 * @returns Tailwind color class
 */
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    streaming: 'bg-red-500/20 text-red-300',
    productivity: 'bg-blue-500/20 text-blue-300',
    fitness: 'bg-green-500/20 text-green-300',
    music: 'bg-purple-500/20 text-purple-300',
    gaming: 'bg-orange-500/20 text-orange-300',
    news: 'bg-yellow-500/20 text-yellow-300',
    education: 'bg-indigo-500/20 text-indigo-300',
    finance: 'bg-emerald-500/20 text-emerald-300',
    shopping: 'bg-pink-500/20 text-pink-300',
    cloud_storage: 'bg-cyan-500/20 text-cyan-300',
    default: 'bg-gray-500/20 text-gray-300',
  };

  return colors[category] || colors.default;
};

/**
 * Calculate savings percentage
 * @param originalAmount - Original amount
 * @param newAmount - New amount after savings
 * @returns Savings percentage
 */
export const calculateSavingsPercentage = (
  originalAmount: number,
  newAmount: number
): number => {
  if (originalAmount === 0) return 0;
  return Math.round(((originalAmount - newAmount) / originalAmount) * 100);
};

/**
 * Format file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if device is mobile
 * @returns Boolean indicating if device is mobile
 */
export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise resolving to success status
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

/**
 * Combine CSS class names
 * @param classes - Array of class names or conditional classes
 * @returns Combined class string
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};