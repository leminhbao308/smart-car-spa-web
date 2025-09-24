/**
 * Main API Export File
 * Central export point for all API-related functionality
 */

// Types
export * from './types';

// Services
export * from './services';

// Hooks
export * from './hooks/useAuth';

// Utils
export { TokenManager } from './utils/token.manager';
export * from './utils/api.helpers';

// Axios client
export { apiClient, enhancedApiClient } from './axios';
export { default as defaultApiClient } from './axios';

// Re-export commonly used items for convenience
export { AuthService } from './services/auth.service';
export { useAuth, useAuthState, useAuthActions, AuthProvider } from './hooks/useAuth';
