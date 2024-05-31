module.exports = {
  preset: 'ts-jest',
  testTimeout: 10000, // 10 seconds
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts']
};
