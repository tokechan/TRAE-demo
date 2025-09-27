import { create } from 'zustand';
import React from 'react';
import { subscriptionDetectionService, DetectedSubscription, DetectionResult, BankTransaction } from '../services/subscriptionDetection';
import { supabase, AuthService } from '../lib/supabase';

/**
 * Interface for subscription state
 */
interface SubscriptionState {
  // Detected subscriptions from bank analysis
  detectedSubscriptions: DetectedSubscription[];
  
  // Confirmed subscriptions saved to database
  confirmedSubscriptions: Subscription[];
  
  // Detection analysis result
  detectionResult: DetectionResult | null;
  
  // Loading states
  isAnalyzing: boolean;
  isLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Bank transactions
  transactions: BankTransaction[];
}

/**
 * Interface for subscription actions
 */
interface SubscriptionActions {
  // Detection and analysis
  analyzeTransactions: (transactions: BankTransaction[]) => Promise<void>;
  loadMockData: () => Promise<void>;
  
  // Subscription management
  confirmSubscription: (detectedSub: DetectedSubscription) => Promise<void>;
  loadConfirmedSubscriptions: () => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}

/**
 * Combined subscription store interface
 */
type SubscriptionStore = SubscriptionState & SubscriptionActions;

/**
 * Initial state for the subscription store
 */
const initialState: SubscriptionState = {
  detectedSubscriptions: [],
  confirmedSubscriptions: [],
  detectionResult: null,
  isAnalyzing: false,
  isLoading: false,
  error: null,
  transactions: []
};

/**
 * Subscription store using Zustand
 * Manages subscription detection, confirmation, and CRUD operations
 */
// Database subscription interface matching our Supabase schema
interface DatabaseSubscription {
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
  cancellation_url?: string;
  auto_detected: boolean;
  created_at: string;
  updated_at: string;
}

// Type alias for consistency
type Subscription = DatabaseSubscription;

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => {
  
  return {
    ...initialState,
    
    /**
     * Analyze bank transactions to detect subscription patterns
     */
    analyzeTransactions: async (transactions: BankTransaction[]) => {
      set({ isAnalyzing: true, error: null, transactions });
      
      try {
        // Service is ready to use
        
        // Analyze transactions
        const result = await subscriptionDetectionService.analyzeTransactions(transactions);
        
        set({
          detectionResult: {
            detectedSubscriptions: result,
            confidence: 0.85,
            source: 'bank' as const
          },
          detectedSubscriptions: result,
          isAnalyzing: false
        });
      } catch (error) {
        console.error('Failed to analyze transactions:', error);
        set({
          error: 'Failed to analyze transactions. Please try again.',
          isAnalyzing: false
        });
      }
    },
    
    /**
     * Load sample data for testing (creates initial subscriptions if none exist)
     */
    loadMockData: async () => {
      set({ isAnalyzing: true, error: null });
      
      try {
        // Get current user
        const user = await AuthService.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Check if user already has subscriptions
        const { data: existingSubscriptions } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        // If no subscriptions exist, create sample data
        if (!existingSubscriptions || existingSubscriptions.length === 0) {
          const sampleSubscriptions = [
            {
              user_id: user.id,
              service_name: 'Netflix',
              description: 'Video streaming service',
              amount: 15.99,
              currency: 'USD',
              billing_cycle: 'monthly' as const,
              next_billing_date: '2024-02-15',
              status: 'active' as const,
              category: 'Entertainment',
              auto_detected: false
            },
            {
              user_id: user.id,
              service_name: 'Spotify',
              description: 'Music streaming service',
              amount: 9.99,
              currency: 'USD',
              billing_cycle: 'monthly' as const,
              next_billing_date: '2024-02-10',
              status: 'active' as const,
              category: 'Entertainment',
              auto_detected: false
            }
          ];
          
          const { error } = await supabase
            .from('subscriptions')
            .insert(sampleSubscriptions);
          
          if (error) throw error;
        }
        
        // Simulate detection of new subscriptions
        const mockDetected: DetectedSubscription[] = [
          {
            name: 'Adobe Creative Cloud',
            merchant: 'Adobe Creative Cloud',
            amount: 52.99,
            category: 'Software',
            billingCycle: 'monthly' as const,
            frequency: 'monthly' as const,
            nextBilling: new Date('2024-02-20'),
            nextBillingDate: new Date('2024-02-20'),
            confidence: 0.89,
            source: 'bank' as const
          }
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        set({
          detectedSubscriptions: mockDetected,
          isAnalyzing: false
        });
        
        // Reload confirmed subscriptions to show the new data
        get().loadConfirmedSubscriptions();
      } catch (error) {
        console.error('Failed to load mock data:', error);
        set({
          error: 'Failed to load mock data. Please try again.',
          isAnalyzing: false
        });
      }
    },
    
    /**
     * Confirm a detected subscription and save to database
     */
    confirmSubscription: async (detectedSub: DetectedSubscription) => {
      set({ isLoading: true, error: null });
      
      try {
        // Get current user
        const user = await AuthService.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Convert detected subscription to database format
        const subscriptionData = {
          user_id: user.id,
          service_name: detectedSub.merchant,
          amount: detectedSub.amount,
          billing_cycle: detectedSub.frequency,
          next_billing_date: detectedSub.nextBillingDate,
          status: 'active' as const,
          category: detectedSub.category || 'Other',
          description: 'Detected from bank transactions',
          currency: 'USD',
          auto_detected: true
        };
        
        // Save to Supabase database
        const { data, error } = await supabase
          .from('subscriptions')
          .insert([subscriptionData])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update state
        set(state => ({
          confirmedSubscriptions: [...state.confirmedSubscriptions, data],
          detectedSubscriptions: state.detectedSubscriptions.filter(
            sub => sub.merchant !== detectedSub.merchant
          ),
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to confirm subscription:', error);
        set({
          error: 'Failed to confirm subscription. Please try again.',
          isLoading: false
        });
      }
    },
    
    /**
     * Load confirmed subscriptions from database
     */
    loadConfirmedSubscriptions: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Get current user
        const user = await AuthService.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Fetch subscriptions from Supabase
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        set({
          confirmedSubscriptions: data || [],
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to load subscriptions:', error);
        set({
          error: 'Failed to load subscriptions. Please try again.',
          isLoading: false
        });
      }
    },
    
    /**
     * Update an existing subscription
     */
    updateSubscription: async (id: string, updates: Partial<Subscription>) => {
      set({ isLoading: true, error: null });
      
      try {
        // Update subscription in Supabase
        const { data, error } = await supabase
          .from('subscriptions')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        // Update local state
        set(state => ({
          confirmedSubscriptions: state.confirmedSubscriptions.map(sub =>
            sub.id === id ? data : sub
          ),
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to update subscription:', error);
        set({
          error: 'Failed to update subscription. Please try again.',
          isLoading: false
        });
      }
    },
    
    /**
     * Delete a subscription
     */
    deleteSubscription: async (id: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // Delete subscription from Supabase
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Update local state
        set(state => ({
          confirmedSubscriptions: state.confirmedSubscriptions.filter(sub => sub.id !== id),
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to delete subscription:', error);
        set({
          error: 'Failed to delete subscription. Please try again.',
          isLoading: false
        });
      }
    },
    
    /**
     * Clear error state
     */
    clearError: () => {
      set({ error: null });
    },
    
    /**
     * Reset store to initial state
     */
    reset: () => {
      set(initialState);
    }
  };
});

/**
 * Selector hooks for specific parts of the store
 */
export const useDetectedSubscriptions = () => useSubscriptionStore(state => state.detectedSubscriptions);
export const useConfirmedSubscriptions = () => useSubscriptionStore(state => state.confirmedSubscriptions);
export const useDetectionResult = () => useSubscriptionStore(state => state.detectionResult);

// Use memoized selector to prevent infinite re-renders
export const useSubscriptionLoading = () => {
  const isAnalyzing = useSubscriptionStore(state => state.isAnalyzing);
  const isLoading = useSubscriptionStore(state => state.isLoading);
  
  return React.useMemo(() => ({
    isAnalyzing,
    isLoading
  }), [isAnalyzing, isLoading]);
};
export const useSubscriptionError = () => useSubscriptionStore(state => state.error);

// Individual loading state selectors for better performance
export const useIsAnalyzing = () => useSubscriptionStore(state => state.isAnalyzing);
export const useIsLoading = () => useSubscriptionStore(state => state.isLoading);

// Memoized action hooks to prevent infinite re-renders in useEffect
export const useLoadConfirmedSubscriptions = () => {
  const loadConfirmedSubscriptions = useSubscriptionStore(state => state.loadConfirmedSubscriptions);
  return React.useCallback(loadConfirmedSubscriptions, [loadConfirmedSubscriptions]);
};