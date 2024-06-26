module.exports = {
    collectCoverageFrom: [ 'src/**/*.ts' ],
    "coveragePathIgnorePatterns": [
        "<rootDir>/src/\\$global.ts",
        "<rootDir>/src/test-artifacts",
        "<rootDir>/src/index.*"
    ],
    detectOpenHandles: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    // transform: { '\\.tsx?$': 'ts-jest' }
};
