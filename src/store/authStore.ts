import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService, DatabaseService } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * User interface for authentication
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication actions interface
 */
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Combined auth store type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * Authentication service integration with Supabase
 */
const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const { user: authUser } = await AuthService.signIn(email, password);
      
      if (!authUser) {
        throw new Error('認証に失敗しました');
      }

      // Get or create user profile
      let userProfile = await DatabaseService.getUserProfile(authUser.id);
      
      if (!userProfile) {
        // Create user profile if it doesn't exist
        console.log('Creating user profile for:', authUser.email);
        userProfile = await DatabaseService.upsertUserProfile({
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      return userProfile;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ログインに失敗しました');
    }
  },

  async register(email: string, password: string, name: string): Promise<User> {
    try {
      const { user: authUser } = await AuthService.signUp(email, password, name);
      
      if (!authUser) {
        throw new Error('ユーザー登録に失敗しました');
      }

      // Create user profile
      console.log('Creating user profile for new user:', authUser.email);
      const userProfile = await DatabaseService.upsertUserProfile({
        id: authUser.id,
        email: authUser.email!,
        name,
        avatar_url: authUser.user_metadata?.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return userProfile;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ユーザー登録に失敗しました');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const authUser = await AuthService.getUser();
    
    if (!authUser) {
      return null;
    }

    const userProfile = await DatabaseService.getUserProfile(authUser.id);
    return userProfile;
  }
};

/**
 * Authentication store using Zustand
 * Handles user authentication state and actions
 */
export const useAuthStore = create<AuthStore>()(persist(
  (set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Actions
    login: async (email: string, password: string) => {
      try {
        set({ isLoading: true, error: null });
        
        const user = await authService.login(email, password);
        
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'ログインに失敗しました'
        });
      }
    },

    register: async (email: string, password: string, name: string) => {
      try {
        set({ isLoading: true, error: null });
        
        const user = await authService.register(email, password, name);
        
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'ユーザー登録に失敗しました'
        });
      }
    },

    logout: async () => {
      try {
        await AuthService.signOut();
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      }
    },

    updateUser: (updates: Partial<User>) => {
      const { user } = get();
      if (user) {
        set({
          user: { ...user, ...updates }
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    }
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated
    })
  }
));

/**
 * Hook to get authentication status
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore();
  return { user, isAuthenticated, isLoading, error };
};

/**
 * Hook to get authentication actions
 */
export const useAuthActions = () => {
  const { login, register, logout, updateUser, clearError, setLoading } = useAuthStore();
  return { login, register, logout, updateUser, clearError, setLoading };
};