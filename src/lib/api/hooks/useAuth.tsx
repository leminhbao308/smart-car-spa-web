/**
 * useAuth Hook
 * React hook for authentication state management
 */

'use client';

import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { AuthService } from '../services/auth.service';
import { AuthState, AuthContextType, LoginRequest, UserInfo } from '../types';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Provides authentication context to the entire app
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Initialize auth state from storage
   */
  const initializeAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if user is authenticated
      const isAuthenticated = AuthService.isAuthenticated();
      
      if (isAuthenticated) {
        // Get user info from storage
        const userFromStorage = AuthService.getCurrentUserFromStorage();
        
        if (userFromStorage) {
          setState(prev => ({
            ...prev,
            user: userFromStorage,
            isAuthenticated: true,
            isLoading: false,
          }));
        } else {
          // Try to get user info from API
          const userFromAPI = await AuthService.getCurrentUser();
          
          if (userFromAPI) {
            setState(prev => ({
              ...prev,
              user: userFromAPI,
              isAuthenticated: true,
              isLoading: false,
            }));
          } else {
            // Clear auth if user info not available
            AuthService.clearAuth();
            setState(prev => ({
              ...prev,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            }));
          }
        }
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      }));
    }
  }, []);

  /**
   * Login function
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const loginResponse = await AuthService.login(credentials);
      
      setState(prev => ({
        ...prev,
        user: loginResponse.user_info,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Login failed';
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await AuthService.logout();
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if logout API fails
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
    }
  }, []);

  /**
   * Refresh token function
   */
  const refreshToken = useCallback(async () => {
    try {
      await AuthService.refreshToken();
      
      // Get updated user info
      const user = AuthService.getCurrentUserFromStorage();
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        error: null,
      }));
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Clear auth state if refresh fails
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        error: 'Session expired. Please login again.',
      }));
      
      throw error;
    }
  }, []);

  /**
   * Verify token function
   */
  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const isValid = await AuthService.verifyToken();
      
      if (!isValid) {
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          error: 'Invalid session. Please login again.',
        }));
      }
      
      return isValid;
    } catch (error) {
      console.error('Token verification error:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        error: 'Session verification failed.',
      }));
      return false;
    }
  }, []);

  /**
   * Clear error function
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Update user info function
   */
  const updateUser = useCallback((user: UserInfo) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up token refresh interval
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Automatic token refresh failed:', error);
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [state.isAuthenticated, refreshToken]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    verifyToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Hook to access authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * useAuthState Hook
 * Hook to get only authentication state (without actions)
 */
export function useAuthState(): AuthState {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  return { user, isAuthenticated, isLoading, error };
}

/**
 * useAuthActions Hook
 * Hook to get only authentication actions
 */
export function useAuthActions() {
  const { login, logout, refreshToken, verifyToken, clearError } = useAuth();
  return { login, logout, refreshToken, verifyToken, clearError };
}
