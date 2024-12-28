import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import AEFCalculator from './components/AEFCalculator'
import './index.css'

// Simple wrapper component
const TestApp = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Log when component is mounted
    console.log('TestApp mounted');
    setMounted(true);
    
    // Add test class to body for styling
    document.body.classList.add('bg-gray-100', 'min-h-screen', 'py-8');
    
    return () => {
      console.log('TestApp unmounting');
      document.body.classList.remove('bg-gray-100', 'min-h-screen', 'py-8');
    };
  }, []);

  // Add error boundary
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Runtime error:', event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (!mounted) {
    console.log('TestApp not yet mounted');
    return <div>Loading...</div>;
  }

  console.log('TestApp rendering calculator');
  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <AEFCalculator />
      </div>
    </div>
  );
};

// Wait for DOM to be ready
const mount = () => {
  console.log('Mount function called');
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  console.log('Creating React root');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  );
  console.log('React root created and rendered');
};

// Ensure DOM is ready
if (document.readyState === 'loading') {
  console.log('Document still loading, adding DOMContentLoaded listener');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    mount();
  });
} else {
  console.log('Document already loaded, mounting immediately');
  mount();
}