import { setupServer } from 'msw/node';
import { analysisResultsHandlers } from './handlers/analysisResultsHandlers';
import { evalueeHandlers } from './handlers/evalueeHandlers';

// Combine all handlers
export const handlers = [
  ...analysisResultsHandlers,
  ...evalueeHandlers,
];

// Setup server with all handlers
export const server = setupServer(...handlers);
