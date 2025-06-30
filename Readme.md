### detective-module [![npm](http://img.shields.io/npm/v/detective-module.svg)](https://npmjs.org/package/detective-module) [![npm](http://img.shields.io/npm/dm/detective-module.svg)](https://npmjs.org/package/detective-module)

> Get the dependencies specifier of an ES6 module and CommonJS require() - **Powered by oxc-parser for blazing fast performance** ⚡

`npm install detective-module`

### ✨ Features

- **🚀 High Performance**: Built with [oxc-parser](https://github.com/oxc-project/oxc) (Rust-based) for 3-5x faster parsing
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
  },
  {
    name: "@/services/api",
    members: [
      {
        name: "fetchUser",
        alias: "fetchUser",
      },
    ],
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
  },
];
```

### Performance

Thanks to the oxc-parser (Rust-based), detective-module now offers:

- **⚡ 3-5x faster** than previous Babel-based implementations
- **🎯 ~4,800+ operations/second** on modern hardware
- **📦 Smaller bundle size** with fewer dependencies
- **🛡️ Better error recovery** and parsing reliability

### API

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

Version 4.0+ uses oxc-parser instead of node-source-walk for better performance. The API remains the same, so no code changes are needed.

#### License

MIT
