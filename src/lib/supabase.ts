import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * Handles authentication, database operations, and real-time subscriptions
 * Uses environment variables for secure key management
 */

// Environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('Supabase configuration loaded:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length
});

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  account_type: 'bank' | 'credit_card' | 'paypal' | 'other';
  account_name: string;
  last_four?: string;
  is_active: boolean;
  connected_at: string;
  last_sync: string;
}

export interface SubscriptionService {
  id: string;
  name: string;
  category: string;
  logo_url?: string;
  website_url?: string;
  cancellation_url?: string;
  cancellation_phone?: string;
  cancellation_difficulty: 'easy' | 'medium' | 'hard';
  average_cancellation_time: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  service_id: string;
  account_id: string;
  amount: number;
  currency: string;
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_billing_date: string;
  status: 'active' | 'cancelled' | 'paused' | 'expired' | 'trial';
  detected_at: string;
  last_charged: string;
  service?: SubscriptionService;
}

export interface CancellationAttempt {
  id: string;
  user_id: string;
  subscription_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  method: 'website' | 'phone' | 'email' | 'chat';
  started_at: string;
  completed_at?: string;
  notes?: string;
  difficulty_rating?: number;
  success_rating?: number;
}

// Authentication service
export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get the current user session
   */
  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  /**
   * Get the current user
   */
  static async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  }

  /**
   * Update user password
   */
  static async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: { name?: string; avatar_url?: string }) {
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Database service
export class DatabaseService {
  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create or update user profile
   */
  static async upsertUserProfile(user: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user subscriptions
   */
  static async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        service:subscription_services(*)
      `)
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get connected accounts
   */
  static async getConnectedAccounts(userId: string): Promise<ConnectedAccount[]> {
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('connected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get subscription services
   */
  static async getSubscriptionServices(): Promise<SubscriptionService[]> {
    const { data, error } = await supabase
      .from('subscription_services')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get cancellation attempts
   */
  static async getCancellationAttempts(userId: string): Promise<CancellationAttempt[]> {
    const { data, error } = await supabase
      .from('cancellation_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create cancellation attempt
   */
  static async createCancellationAttempt(
    attempt: Omit<CancellationAttempt, 'id' | 'started_at'>
  ): Promise<CancellationAttempt> {
    const { data, error } = await supabase
      .from('cancellation_attempts')
      .insert({
        ...attempt,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update cancellation attempt
   */
  static async updateCancellationAttempt(
    id: string,
    updates: Partial<CancellationAttempt>
  ): Promise<CancellationAttempt> {
    const { data, error } = await supabase
      .from('cancellation_attempts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default supabase;