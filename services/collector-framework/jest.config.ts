import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@egypt/shared-types$': '<rootDir>/../../packages/shared-types/src',
    '^@egypt/shared-schemas$': '<rootDir>/../../packages/shared-schemas/src',
    '^@egypt/shared-utils$': '<rootDir>/../../packages/shared-utils/src',
  },
};

export default config;