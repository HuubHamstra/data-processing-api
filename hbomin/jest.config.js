module.exports = {
    testEnvironment: 'node',
    testRegex: '(/test/.*|(\\.|/)(test|spec))\\.js$',
    moduleFileExtensions: ['js', 'json', 'node'],
    collectCoverage: false,
    collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/test/**'],
    coverageReporters: ['lcov', 'text-summary'],
    verbose: true,
  };
  