module.exports = {
  preset: 'ts-jest',
  verbose: true,
  setupFilesAfterEnv: ['./src/__tests__/jest.setup.js'],
  testTimeout: 20000, // 20 seconds
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts']
};
