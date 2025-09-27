/**
 * Server-side Supabase client configuration
 * Uses the service role key for administrative operations
 * DO NOT expose this client to the frontend
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables for server-side Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

/**
 * Server-side Supabase client with service role key
 * This client has elevated privileges and should only be used on the server
 * Never expose this client or its key to the frontend
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Server-side authentication utilities
 */
export class ServerAuthService {
  /**
   * Verify a user's JWT token
   */
  static async verifyToken(token: string) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }

  /**
   * Get user by ID (admin operation)
   */
  static async getUserById(userId: string) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error) throw error;
    return data.user;
  }

  /**
   * Create user (admin operation)
   */
  static async createUser(email: string, password: string, userData?: any) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: userData
    });
    if (error) throw error;
    return data.user;
  }

  /**
   * Delete user (admin operation)
   */
  static async deleteUser(userId: string) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}

/**
 * Server-side database utilities
 */
export class ServerDatabaseService {
  /**
   * Get all users (admin operation)
   */
  static async getAllUsers() {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  /**
   * Update user data (admin operation)
   */
  static async updateUserData(userId: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Delete user data (admin operation)
   */
  static async deleteUserData(userId: string) {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
  }
}

export default supabaseAdmin;