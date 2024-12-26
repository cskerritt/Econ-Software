import '@testing-library/jest-dom/vitest';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Mock MUI components that might cause issues
vi.mock('@mui/x-date-pickers/DatePicker', () => {
  return {
    DatePicker: (props: { value: Date | null; onChange: (date: Date | null) => void; label: string }) => {
      return React.createElement('input', {
        type: 'date',
        value: props.value?.toISOString().split('T')[0] || '',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          props.onChange(e.target.value ? new Date(e.target.value) : null);
        },
        'aria-label': props.label
      });
    }
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});