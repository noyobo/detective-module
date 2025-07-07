import { describe, expect, it } from "vitest";
import {
	detectiveModule as detective,
	detectiveModuleAndRequire,
} from "./index.js";

describe("detective-es6", () => {
	const ast = {
		type: "Program",
		body: [
			{
				type: "VariableDeclaration",
				declarations: [
					{
						type: "VariableDeclarator",
						id: {
							type: "Identifier",
							name: "x",
						},
						init: {
							type: "Literal",
							value: 4,
							raw: "4",
						},
					},
				],
				kind: "let",
			},
		],
	};

	it("accepts an ast", () => {
		const deps = detective(ast);
		expect(deps).toMatchSnapshot();
	});

	it("retrieves the dependencies of es6 modules", () => {
		const deps = detective('import Abc, * as All from "mylib";');
		expect(deps).toMatchSnapshot();
	});

	it("impoet ImportNamespaceSpecifier the dependencies of es6 modules", () => {
		const deps = detective('import Abc, {a, b, c as d}from "mylib";');
		expect(deps).toMatchSnapshot();
	});

	it("retrieves the re-export dependencies of es6 modules", () => {
		const deps = detective('export {foo, bar} from "mylib";');
		expect(deps).toMatchSnapshot();
	});

	it("retrieves the re-export dependencies alias of es6 modules", () => {
		const deps = detective('export {foo as Foo} from "mylib";');
		expect(deps).toMatchSnapshot();
	});

	it("retrieves the re-export * dependencies of es6 modules", () => {
		const deps = detective('export * from "mylib";');
		expect(deps).toMatchSnapshot();
	});

	it("handles multiple imports", () => {
		const deps = detective(
			'import {foo as Foo, bar} from "mylib";\nimport "mylib2"',
		);

		expect(deps).toMatchSnapshot();
	});

	it("handles default imports", () => {
		const deps = detective('import foo from "foo";');

		expect(deps).toMatchSnapshot();
	});

	it("support typescript", () => {
		const deps = detective('import foo from "foo"; var a: string = "";');

		expect(deps).toMatchSnapshot();
	});

	it("returns an empty list for non-es6 modules", () => {
		const deps = detective('var foo = require("foo");');
		expect(deps).toMatchSnapshot();
	});

	it("does not throw with jsx in a module", () => {
		expect(() => {
			detective('import foo from "foo"; var templ = <jsx />;');
		}).not.toThrow();
	});

	it("does not throw on an async ES7 function", () => {
		expect(() => {
			detective(
				'import foo from "foo"; export default async function bar() {}',
			);
		}).not.toThrow();
	});

	it("case1", () => {
		expect(
			detective(`import React, { Component } from 'react';
import {fetchUser} from '@/service/user';
export default class Home extends Component {
    static pageConfig = { fixedIcon: { backHome: false } };
    componentDidMount () {
        console.log('===== auth ======');
        WPT.setTitle(' ');
        fetchUser();
    }
    render() {
        return (
            <div></div>
        );
    }
}
`),
		).toMatchSnapshot();
	});

	it("case2", () => {
		expect(
			detective(`import Cookies from 'js-cookie';
export function saveUserToken () {
}
`),
		).toMatchSnapshot();
	});
});

describe("detective-module-and-require", () => {
	const ast = {
		type: "Program",
		body: [
			{
				type: "VariableDeclaration",
				declarations: [
					{
						type: "VariableDeclarator",
						id: {
							type: "Identifier",
							name: "x",
						},
						init: {
							type: "Literal",
							value: 4,
							raw: "4",
						},
					},
				],
				kind: "let",
			},
		],
	};

	it("accepts an ast", () => {
		const deps = detectiveModuleAndRequire(ast);
		expect(deps).toMatchSnapshot();
	});

	it("retrieves the dependencies of es6 modules", () => {
		const deps = detectiveModuleAndRequire(
			'import Abc, * as All from "mylib";',
		);
		expect(deps).toMatchSnapshot();
	});

	it("impoet ImportNamespaceSpecifier the dependencies of es6 modules", () => {
		const deps = detectiveModuleAndRequire(
			'import Abc, {a, b, c as d}from "mylib";',
		);
		expect(deps).toMatchSnapshot();
	});

	it("retrieves the re-export dependencies of es6 modules", () => {
		const deps = detectiveModuleAndRequire('export {foo, bar} from "mylib";');
		expect(deps).toMatchSnapshot();
	});

	it("retrieves the re-export dependencies alias of es6 modules", () => {
		const deps = detectiveModuleAndRequire('export {foo as Foo} from "mylib";');
		expect(deps).toMatchSnapshot();
	});

	it("retrieves the re-export * dependencies of es6 modules", () => {
		const deps = detectiveModuleAndRequire('export * from "mylib";');
		expect(deps).toMatchSnapshot();
	});

	it("handles multiple imports", () => {
		const deps = detectiveModuleAndRequire(
			'import {foo as Foo, bar} from "mylib";\nimport "mylib2"',
		);

		expect(deps).toMatchSnapshot();
	});

	it("handles default imports", () => {
		const deps = detectiveModuleAndRequire('import foo from "foo";');

		expect(deps).toMatchSnapshot();
	});

	it("support typescript", () => {
		const deps = detectiveModuleAndRequire(
			'import foo from "foo"; var a: string = "";',
		);

		expect(deps).toMatchSnapshot();
	});

	it("support non-es6 modules", () => {
		const deps = detectiveModuleAndRequire('var bar = require("foo");');
		expect(deps).toMatchSnapshot();
	});

	it("support non-es6 exports", () => {
		const deps = detectiveModuleAndRequire(
			'var {default: foo, a, b: c} = require("foo");',
		);
		expect(deps).toMatchSnapshot();
	});

	it("does not throw with jsx in a module", () => {
		expect(() => {
			detectiveModuleAndRequire('import foo from "foo"; var templ = <jsx />;');
		}).not.toThrow();
	});

	it("does not throw on an async ES7 function", () => {
		expect(() => {
			detectiveModuleAndRequire(
				'import foo from "foo"; export default async function bar() {}',
			);
		}).not.toThrow();
	});

	it("case1", () => {
		expect(
			detectiveModuleAndRequire(`import React, { Component } from 'react';

import {fetchUser} from '@/service/user';

export default class Home extends Component {
    static pageConfig = { fixedIcon: { backHome: false } };
    componentDidMount () {
        console.log('===== auth ======');
        WPT.setTitle(' ');
        fetchUser();
    }

    render() {
        return (
            <div></div>
        );
    }
}
`),
		).toMatchSnapshot();
	});

	it("case2", () => {
		expect(
			detectiveModuleAndRequire(`import Cookies from 'js-cookie';
export function saveUserToken () {
}
`),
		).toMatchSnapshot();
	});
});
