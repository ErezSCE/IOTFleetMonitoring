module.exports = {
  testPathIgnorePatterns: ['<rootDir>/**/*.spec.ts'],
  // Disable type checking diagnostics to allow test files with minor type issues
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // Match .spec.ts and .spec.tsx files
  testRegex: '.*\\.spec\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: '../coverage',
};