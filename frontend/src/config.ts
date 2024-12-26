let API_URL = 'http://localhost:8000/api';

// Handle different environments
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  // Test environment
  API_URL = 'http://localhost:8000/api';
} else if (typeof window !== 'undefined' && (window as any).__VITE_API_URL__) {
  // Browser environment with injected URL
  API_URL = (window as any).__VITE_API_URL__;
}

export const API_BASE_URL = API_URL;
