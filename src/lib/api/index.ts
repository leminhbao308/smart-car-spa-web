/**
 * Main API Export File
 * Central export point for all API-related functionality
 */

// Types
// export * from './types';

// Services
export * from './services';

// Types
export * from './types';

// Hooks
export * from './hooks/useAuth';
export * from './hooks/usePromotions';

// Utils
export { TokenManager } from './utils/token.manager';
export * from './utils/api.helpers';
export * from './utils/auth.helpers';

// Axios client
export { default as apiClient } from './axios';

// Re-export commonly used items for convenience
export { AuthService } from './services/auth.service';
export { useAuth, useAuthState, useAuthActions, AuthProvider } from './hooks/useAuth';
