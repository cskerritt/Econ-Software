/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^../services/analysisService$': '<rootDir>/src/__mocks__/analysisService.ts',
    '^../services/evalueeService$': '<rootDir>/src/__mocks__/evalueeService.ts'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/', // Exclude Playwright tests
    '/e2e/',   // Also exclude any e2e test directory
    '\\.spec\\.ts$', // Exclude files ending in .spec.ts
  ],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true,
    }],
    '^.+\\.jsx?$': 'babel-jest',
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
    'window.__VITE_API_URL__': 'http://localhost:8000/api'
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library/dom|@testing-library/user-event)/)',
  ],
};
