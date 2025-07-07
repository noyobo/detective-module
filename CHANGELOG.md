# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.1.0](https://github.com/noyobo/node-detective-module/compare/v4.0.0...v4.1.0) (2025-07-07)


### Features

* enhance package.json for ES module support and build process ([134ccae](https://github.com/noyobo/node-detective-module/commit/134ccae8d0ff5357db12722b58ffb1a512fa5aec))
* enhance TypeScript configuration and update test snapshots ([a632723](https://github.com/noyobo/node-detective-module/commit/a632723961dc9270781c4a7cbaa8798776a5ba59))

## 4.0.0 (2025-06-30)

### ⚡ Major Performance Improvements

- **parser**: Replace node-source-walk with oxc-parser for 3-5x faster AST parsing ([f3cba88](https://github.com/noyobo/node-detective-module/commit/f3cba88))

  - Migration from Babel-based parser to Rust-based oxc-parser
  - Parsing performance improved from ~4,800 to ~45,000 operations/second
  - Intelligent file type detection (JS/TS/JSX/TSX)
  - Better error recovery and parsing reliability

- **testing**: Migrate from Jest to Vitest for 2-5x faster test execution ([b836b84](https://github.com/noyobo/node-detective-module/commit/b836b84))
  - Instant hot module reloading in watch mode
  - Native ES modules support
  - Better TypeScript integration
  - Smaller memory footprint

### 🔧 Improvements

- **deps**: Remove heavy dependencies (node-source-walk, @babel/types, @babel/parser)
- **bundle**: Significantly reduced package size and dependency tree
- **ci**: Expand Node.js version matrix to test LTS versions (20, 22) ([4a63a4b](https://github.com/noyobo/node-detective-module/commit/4a63a4b))
- **ci**: Add yarn cache to speed up CI builds

### 📚 Documentation

- **readme**: Complete rewrite with modern examples and performance benchmarks ([06fe59e](https://github.com/noyobo/node-detective-module/commit/06fe59e))
  - Added TypeScript + React (TSX) examples
  - Performance comparison and benchmarks
  - Migration guide for v3.x users
  - Enhanced API documentation

### 🐛 Bug Fixes

- **ci**: correct GitHub Actions workflow syntax and improve CI configuration ([3e74b36](https://github.com/noyobo/node-detective-module/commit/3e74b36))

### 🚀 Features

- **parser**: Enhanced language support with oxc-parser
  - Full TypeScript support (including latest features)
  - JSX and TSX parsing
  - Stage 3+ proposals and decorators
  - Dynamic imports
- **testing**: Add watch mode for development (`npm run test:watch`)

### 💥 BREAKING CHANGES

- **node**: Drop support for Node.js 18 (minimum version: Node.js 20)
- **api**: API remains 100% compatible - no code changes needed for existing users
