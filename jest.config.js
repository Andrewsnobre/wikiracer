module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json'
      }
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts']
  };
  