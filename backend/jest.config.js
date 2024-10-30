module.exports = {
  testEnvironment: 'node', // 使用 Node 测试环境
  collectCoverage: true,  // 开启测试覆盖率收集
  coverageDirectory: 'coverage', // 指定覆盖率报告输出目录
  testPathIgnorePatterns: ['/node_modules/'], // 忽略 node_modules 目录
};
