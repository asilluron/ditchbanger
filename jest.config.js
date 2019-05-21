module.exports = {
    roots: [
      '<rootDir>/src'
    ],
    transform: {
      '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '/__tests__/.*\\.(ts|tsx|js)$',
    testEnvironment:'node'
  };
