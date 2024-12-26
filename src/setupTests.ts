import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock the localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  getItemParsed: vi.fn((key) => {
    const item = localStorageMock.getItem(key);
    return item ? JSON.parse(item) : null;
  }),
  setItemParsed: vi.fn((key, value) => {
    localStorageMock.setItem(key, JSON.stringify(value));
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  writable: true,
});

// Mock React Router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: '',
    }),
  };
});

// Mock fetch with more robust implementation
const mockFetch = vi.fn().mockImplementation((url, options) => {
  console.log(`Mocked fetch called with URL: ${url}`, options);
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });
});
(global as any).fetch = mockFetch;

// Mock console methods to reduce noise during tests
console.warn = vi.fn();
console.error = vi.fn();

// Mock MUI and other external components
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    CircularProgress: () => null,
    Button: vi.fn(({ children, ...props }) => children),
  };
});

// Add custom matchers or assertions
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
