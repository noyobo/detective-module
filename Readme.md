### detective-module [![npm](http://img.shields.io/npm/v/detective-module.svg)](https://npmjs.org/package/detective-module) [![npm](http://img.shields.io/npm/dm/detective-module.svg)](https://npmjs.org/package/detective-module)

> Get the dependencies specifier of an ES6 module and CommonJS require() - **Powered by oxc-parser for blazing fast performance** ⚡

`npm install detective-module`

### ✨ Features

- **🚀 High Performance**: Built with [oxc-parser](https://github.com/oxc-project/oxc) (Rust-based) for 3-5x faster parsing
- **⚡ Modern Testing**: Uses [Vitest](https://vitest.dev/) for blazing fast test execution and development experience
- **📦 Zero Configuration**: Works out of the box with intelligent file type detection
- **🎯 Full Language Support**: JavaScript, TypeScript, JSX, TSX, and latest ECMAScript features
- **🔄 Dual Mode**: Supports both ES6 modules (`import/export`) and CommonJS (`require()`)
- **🪶 Lightweight**: Minimal dependencies with optimized bundle size

### Usage

```js
const {
  detectiveModuleAndRequire,
  detectiveModule,
} = require("detective-module");

const mySourceCode = fs.readFileSync("myfile.js", "utf8");

// Pass in a file's content or an AST
const dependencies = detectiveModule(mySourceCode);

// Input:
// import Abc, * as BBBBBB from "mylib";

// Output:
[
  {
    name: "mylib",
    default: "Abc",
    star: true,
    alias: "BBBBBB",
    type: "module",
  },
];
```

### Examples

#### ES6 Modules with Named Imports

```js
// Input:
// import { foo as Foo, bar } from "mylib";

// Output:
[
  {
    name: "mylib",
    members: [
      {
        name: "foo",
        alias: "Foo",
      },
      {
        name: "bar",
        alias: "bar",
      },
    ],
    type: "module",
  },
];
```

#### TypeScript + React (TSX)

```js
// Input:
// import React, { Component } from 'react';
// import { fetchUser } from '@/services/api';
//
// interface Props {
//   theme: string;
// }
//
// export default class App extends Component<Props> {
//   render() {
//     return <div>Hello World</div>;
//   }
// }

// Output:
[
  {
    name: "react",
    default: "React",
    members: [
      {
        name: "Component",
        alias: "Component",
      },
    ],
    type: "module",
  },
  {
    name: "@/services/api",
    members: [
      {
        name: "fetchUser",
        alias: "fetchUser",
      },
    ],
    type: "module",
  },
];
```

#### CommonJS with Destructuring

```js
// Use detectiveModuleAndRequire for both ES6 and CommonJS
const dependencies = detectiveModuleAndRequire(sourceCode);

// Input:
// const { default: React, useState } = require('react');

// Output:
[
  {
    name: "react",
    default: "React",
    members: [
      {
        name: "useState",
        alias: "useState",
      },
    ],
    type: "commonjs",
  },
];
```

### Performance

Thanks to modern tooling (oxc-parser + Vitest), detective-module now offers:

**Parsing Performance:**

- **⚡ 3-5x faster** than previous Babel-based implementations
- **🎯 ~45,000+ operations/second** on modern hardware
- **📦 Smaller bundle size** with fewer dependencies
- **🛡️ Better error recovery** and parsing reliability

**Development Experience:**

- **🧪 2-5x faster test execution** with Vitest vs Jest
- **⚡ Instant hot reload** in watch mode (`npm run test:watch`)
- **🔥 Native ES modules** support without configuration
- **📊 Better error reporting** and debugging experience

### API

#### Dependency 类型说明

每个依赖对象都包含一个 `type` 字段：

- `type: "module"` —— ES6 模块（import/export）
- `type: "commonjs"` —— CommonJS（require）

#### `detectiveModule(code, options?)`

Extracts ES6 import/export dependencies from source code.

- `code`: Source code string or pre-parsed AST object
- `options.filename`: Override file extension for parser context (optional)

#### `detectiveModuleAndRequire(code, options?)`

Extracts both ES6 imports/exports and CommonJS require() dependencies.

- `code`: Source code string or pre-parsed AST object
- `options.filename`: Override file extension for parser context (optional)

### Supported Syntax

- ✅ **JavaScript** (ES5+, ESNext)
- ✅ **TypeScript** (including latest features)
- ✅ **JSX** and **TSX**
- ✅ **ES6 Modules** (`import`/`export`)
- ✅ **CommonJS** (`require()`/`module.exports`)
- ✅ **Dynamic imports** (`import()`)
- ✅ **Stage 3+ proposals** and decorators

### Migration from v3.x

Version 4.0+ includes major improvements:

- **Parser**: Uses oxc-parser instead of node-source-walk for 3-5x better performance
- **Testing**: Migrated from Jest to Vitest for faster development and CI/CD
- **API**: Remains 100% compatible - no code changes needed for existing users

**For Contributors:**

- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode for development

#### License

MIT
