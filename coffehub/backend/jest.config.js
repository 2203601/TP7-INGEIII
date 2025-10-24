export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'cobertura'], // ← para Azure
  collectCoverage: true,
  collectCoverageFrom: [
    'server.js',
    '!node_modules/**',
    '!coverage/**',
    '!tests/**',
    '!jest.config.js'
  ],
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/unit-mocked/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  transform: {},
  forceExit: true,
  detectOpenHandles: true,
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './', outputName: 'junit.xml' }] // ← para Azure
  ]
};
