module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  reporters: [
    'default',
    ['jest-performance-reporter', {
      maxTime: 500, // ms
      slowTestThreshold: 100, // ms
    }]
  ],
  setupFiles: ['./jest.performance.setup.js']
}
