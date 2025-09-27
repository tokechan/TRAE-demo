/**
 * Subscription detection service
 * Handles automatic detection of subscriptions from various sources
 */

// Database subscription interface matching our Supabase schema
export interface DatabaseSubscription {
  id: string;
  user_id: string;
  service_name: string;
  description?: string;
  amount: number;
  currency: string;
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_billing_date?: string;
  status: 'active' | 'cancelled' | 'paused' | 'expired';
  category?: string;
  logo_url?: string;
  website_url?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
}

// Type alias for consistency
type Subscription = DatabaseSubscription;

/**
 * Email patterns for common subscription services
 */
const SUBSCRIPTION_PATTERNS = {
  netflix: {
    domains: ['netflix.com'],
    keywords: ['netflix', 'subscription', 'monthly charge'],
    price: 15.99,
    category: 'Entertainment'
  },
  spotify: {
    domains: ['spotify.com'],
    keywords: ['spotify', 'premium', 'music'],
    price: 9.99,
    category: 'Entertainment'
  },
  adobe: {
    domains: ['adobe.com'],
    keywords: ['adobe', 'creative cloud', 'photoshop'],
    price: 52.99,
    category: 'Software'
  },
  github: {
    domains: ['github.com'],
    keywords: ['github', 'pro', 'developer'],
    price: 4.00,
    category: 'Software'
  },
  dropbox: {
    domains: ['dropbox.com'],
    keywords: ['dropbox', 'storage', 'cloud'],
    price: 11.99,
    category: 'Cloud Storage'
  }
};

/**
 * Bank transaction patterns
 */
export interface BankTransaction {
  id: string;
  amount: number;
  description: string;
  date: Date;
  merchant?: string;
}

/**
 * Email content interface
 */
export interface EmailContent {
  from: string;
  subject: string;
  body: string;
  date: Date;
}

/**
 * Detection result interface
 */
export interface DetectionResult {
  detectedSubscriptions: DetectedSubscription[];
  confidence: number;
  source: 'email' | 'bank' | 'manual';
}

/**
 * Detected subscription interface
 */
export interface DetectedSubscription {
  name: string;
  merchant: string;
  amount: number;
  category: string;
  billingCycle: 'monthly' | 'yearly';
  frequency: 'monthly' | 'yearly';
  nextBilling: Date;
  nextBillingDate: Date;
  confidence: number;
  source: 'email' | 'bank' | 'manual';
}

/**
 * Subscription Detection Service
 */
export class SubscriptionDetectionService {
  /**
   * Analyze bank transactions for subscription patterns
   */
  static analyzeTransactions(transactions: BankTransaction[]): DetectedSubscription[] {
    const detectedSubscriptions: DetectedSubscription[] = [];
    const recurringTransactions = this.findRecurringTransactions(transactions);

    recurringTransactions.forEach(transaction => {
      const pattern = this.matchSubscriptionPattern(transaction.description);
      if (pattern) {
        const nextBillingDate = this.calculateNextBilling(transaction.date);
        detectedSubscriptions.push({
          name: pattern.name,
          merchant: pattern.name,
          amount: Math.abs(transaction.amount),
          category: pattern.category,
          billingCycle: 'monthly',
          frequency: 'monthly',
          nextBilling: nextBillingDate,
          nextBillingDate: nextBillingDate,
          confidence: pattern.confidence,
          source: 'bank'
        });
      }
    });

    return detectedSubscriptions;
  }

  /**
   * Analyze emails for subscription confirmations
   */
  static analyzeEmails(emails: EmailContent[]): DetectedSubscription[] {
    const detectedSubscriptions: DetectedSubscription[] = [];

    emails.forEach(email => {
      const pattern = this.matchEmailPattern(email);
      if (pattern) {
        const nextBillingDate = this.calculateNextBilling(email.date);
        detectedSubscriptions.push({
          name: pattern.name,
          merchant: pattern.name,
          amount: pattern.price,
          category: pattern.category,
          billingCycle: 'monthly',
          frequency: 'monthly',
          nextBilling: nextBillingDate,
          nextBillingDate: nextBillingDate,
          confidence: pattern.confidence,
          source: 'email'
        });
      }
    });

    return detectedSubscriptions;
  }

  /**
   * Find recurring transactions in bank data
   */
  private static findRecurringTransactions(transactions: BankTransaction[]): BankTransaction[] {
    const merchantGroups: { [key: string]: BankTransaction[] } = {};
    
    // Group transactions by merchant/description
    transactions.forEach(transaction => {
      const key = this.normalizeMerchantName(transaction.description);
      if (!merchantGroups[key]) {
        merchantGroups[key] = [];
      }
      merchantGroups[key].push(transaction);
    });

    // Find merchants with recurring patterns
    const recurringTransactions: BankTransaction[] = [];
    Object.values(merchantGroups).forEach(group => {
      if (group.length >= 2 && this.isRecurringPattern(group)) {
        recurringTransactions.push(group[group.length - 1]); // Latest transaction
      }
    });

    return recurringTransactions;
  }

  /**
   * Check if transactions follow a recurring pattern
   */
  private static isRecurringPattern(transactions: BankTransaction[]): boolean {
    if (transactions.length < 2) return false;

    // Sort by date
    const sorted = transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Check for monthly pattern (25-35 days apart)
    for (let i = 1; i < sorted.length; i++) {
      const daysDiff = Math.abs(
        (sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff >= 25 && daysDiff <= 35) {
        return true;
      }
    }

    return false;
  }

  /**
   * Match transaction description to known subscription patterns
   */
  private static matchSubscriptionPattern(description: string): {
    name: string;
    category: string;
    confidence: number;
  } | null {
    const normalizedDesc = description.toLowerCase();

    for (const [serviceName, pattern] of Object.entries(SUBSCRIPTION_PATTERNS)) {
      const matchScore = pattern.keywords.reduce((score, keyword) => {
        return normalizedDesc.includes(keyword.toLowerCase()) ? score + 1 : score;
      }, 0);

      if (matchScore > 0) {
        return {
          name: serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
          category: pattern.category,
          confidence: Math.min(matchScore / pattern.keywords.length, 1)
        };
      }
    }

    return null;
  }

  /**
   * Match email content to subscription patterns
   */
  private static matchEmailPattern(email: EmailContent): {
    name: string;
    price: number;
    category: string;
    confidence: number;
  } | null {
    const content = `${email.subject} ${email.body}`.toLowerCase();
    const fromDomain = email.from.split('@')[1]?.toLowerCase();

    for (const [serviceName, pattern] of Object.entries(SUBSCRIPTION_PATTERNS)) {
      let confidence = 0;

      // Check domain match
      if (fromDomain && pattern.domains.includes(fromDomain)) {
        confidence += 0.5;
      }

      // Check keyword matches
      const keywordMatches = pattern.keywords.filter(keyword => 
        content.includes(keyword.toLowerCase())
      ).length;
      confidence += (keywordMatches / pattern.keywords.length) * 0.5;

      if (confidence > 0.3) {
        return {
          name: serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
          price: pattern.price,
          category: pattern.category,
          confidence
        };
      }
    }

    return null;
  }

  /**
   * Normalize merchant name for grouping
   */
  private static normalizeMerchantName(description: string): string {
    return description
      .toLowerCase()
      .replace(/[0-9]/g, '') // Remove numbers
      .replace(/[^a-z\s]/g, '') // Remove special characters
      .trim()
      .substring(0, 20); // Limit length
  }

  /**
   * Calculate next billing date
   */
  private static calculateNextBilling(lastBilling: Date): Date {
    const nextBilling = new Date(lastBilling);
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    return nextBilling;
  }

  /**
   * Convert detected subscription to Subscription type
   */
  static convertToSubscription(detected: DetectedSubscription): Omit<Subscription, 'id'> {
    return {
      user_id: '', // Will be set by caller
      service_name: detected.name,
      amount: detected.amount,
      currency: 'USD',
      billing_cycle: detected.billingCycle,
      next_billing_date: detected.nextBilling.toISOString(),
      category: detected.category,
      status: 'active',
      description: `Auto-detected from ${detected.source}`,
      website_url: '',
      tags: ['auto-detected']
    };
  }

  /**
   * Mock function to simulate bank connection
   */
  static async connectBank(): Promise<BankTransaction[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock transactions
    return [
      {
        id: '1',
        description: 'NETFLIX.COM',
        amount: -15.99,
        date: new Date('2024-01-15'),
        merchant: 'Netflix'
      },
      {
        id: '2',
        description: 'SPOTIFY PREMIUM',
        amount: -9.99,
        date: new Date('2024-01-10'),
        merchant: 'Spotify'
      },
      {
        id: '3',
        description: 'NETFLIX.COM',
        amount: -15.99,
        date: new Date('2023-12-15'),
        merchant: 'Netflix'
      }
    ];
  }

  /**
   * Mock function to simulate email scanning
   */
  static async scanEmails(): Promise<EmailContent[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock emails
    return [
      {
        from: 'billing@adobe.com',
        subject: 'Your Adobe Creative Cloud subscription',
        body: 'Thank you for your Adobe Creative Cloud subscription payment of $52.99',
        date: new Date('2024-01-20')
      },
      {
        from: 'noreply@github.com',
        subject: 'GitHub Pro subscription confirmation',
        body: 'Your GitHub Pro subscription has been renewed for $4.00',
        date: new Date('2024-01-18')
      }
    ];
  }
}

/**
 * Export singleton instance
 */
export const subscriptionDetectionService = SubscriptionDetectionService;