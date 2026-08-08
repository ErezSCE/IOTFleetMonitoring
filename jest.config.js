module.exports = {
  // Disable type checking diagnostics to allow test files with minor type issues
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: '../coverage',
};
