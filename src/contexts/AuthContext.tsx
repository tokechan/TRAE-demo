import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthService, DatabaseService } from '../lib/supabase';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { User } from '@supabase/supabase-js';

/**
 * Authentication context interface
 */
interface AuthContextType {
  isInitialized: boolean;
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType>({
  isInitialized: false
});

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * Handles authentication state initialization and auth state changes
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { login, logout } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    /**
     * Initialize authentication state with timeout
     */
    const initializeAuth = async () => {
    console.log('🚀 AUTH: Starting authentication initialization...');
    
    try {
      // Set a timeout for the entire initialization process
      const initPromise = (async () => {
        console.log('📡 AUTH: Getting current session...');
        
        // Add timeout to getSession to prevent hanging
        const sessionPromise = AuthService.getSession();
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );
        
        const session = await Promise.race([sessionPromise, timeoutPromise]);
        console.log('📡 AUTH: Session result:', session ? 'Found' : 'None');
        
        if (session?.user) {
          console.log('👤 AUTH: User found, checking profile...');
          
          // Check if user profile exists
           try {
             let profile = await DatabaseService.getUserProfile(session.user.id);
             console.log('👤 AUTH: Profile check result:', profile ? 'Found' : 'Not found');
            
            if (!profile) {
               console.log('👤 AUTH: Creating new user profile...');
               profile = await DatabaseService.upsertUserProfile({
                 id: session.user.id,
                 email: session.user.email || '',
                 name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                 created_at: new Date().toISOString(),
                 updated_at: new Date().toISOString()
               });
             }
             
             // Set authenticated state with profile data
             useAuthStore.setState({
               user: profile,
               isAuthenticated: true,
               isLoading: false,
               error: null
             });
             
           } catch (profileError) {
             console.error('❌ AUTH: Profile error:', profileError);
             // Continue with authentication even if profile fails
             // Create a minimal user object from session data
             const fallbackUser = {
               id: session.user.id,
               email: session.user.email || '',
               name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
               created_at: new Date().toISOString(),
               updated_at: new Date().toISOString()
             };
             useAuthStore.setState({
               user: fallbackUser,
               isAuthenticated: true,
               isLoading: false,
               error: null
             });
          }
        } else {
          console.log('🚫 AUTH: No user session, setting unauthenticated');
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      })();
      
      // Set overall timeout for initialization
      const overallTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Overall initialization timeout')), 8000)
      );
      
      await Promise.race([initPromise, overallTimeout]);
      
    } catch (error) {
      console.error('❌ AUTH: Initialization error:', error);
      // On any error, set to unauthenticated state
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
    } finally {
      // Always set initialized to true when done
      if (mounted) {
        console.log('✅ AUTH: Setting isInitialized to true');
        setIsInitialized(true);
      }
    }
    
    console.log('🏁 AUTH: Authentication initialization complete');
  };

    /**
     * Handle authentication state changes
     */
    const handleAuthStateChange = async (event: string, session: any) => {
      if (!mounted) return;

      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            try {
              // User is authenticated, get profile
              const authUser = session.user;
              let userProfile = await DatabaseService.getUserProfile(authUser.id);
              
              // If user profile doesn't exist, create it
              if (!userProfile) {
                console.log('Creating missing user profile for:', authUser.email);
                userProfile = await DatabaseService.upsertUserProfile({
                  id: authUser.id,
                  email: authUser.email!,
                  name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
                  avatar_url: authUser.user_metadata?.avatar_url,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
              
              if (userProfile) {
                useAuthStore.setState({
                  user: userProfile,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null
                });
              }
            } catch (error) {
              console.error('Error handling SIGNED_IN event:', error);
            }
          }
          break;
        
        case 'SIGNED_OUT':
          // Handle sign out
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          break;
        
        case 'TOKEN_REFRESHED':
          // Token was refreshed, no action needed
          console.log('Token refreshed');
          break;
        
        default:
          break;
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(handleAuthStateChange);

    // Cleanup
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    isInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * Higher-order component for protected routes
 */
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const { isInitialized } = useAuthContext();

    // Show loading while initializing
    if (!isInitialized || isLoading) {
      return <LoadingSpinner />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };
};
