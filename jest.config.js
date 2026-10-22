module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/constants/',
    '<rootDir>/src/index.ts',
    '<rootDir>/src/__type-tests__/',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/constants/',
    '<rootDir>/src/index.ts',
    '<rootDir>/src/__type-tests__/',
    '<rootDir>/src/__test-utils__/',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'text-summary'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
