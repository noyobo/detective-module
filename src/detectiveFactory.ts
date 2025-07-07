import { parseSync } from 'oxc-parser';

// Type definitions for AST nodes
export interface ASTNode {
	type: string;
	parent?: ASTNode;
	[key: string]: unknown;
}

export interface ImportDeclaration extends ASTNode {
	type: 'ImportDeclaration';
	source?: {
		value: string;
	};
	specifiers: Array<{
		type: string;
		local: {
			name: string;
		};
		imported?: {
			name: string;
		};
	}>;
}

export interface ExportNamedDeclaration extends ASTNode {
	type: 'ExportNamedDeclaration';
	source?: {
		value: string;
	};
	specifiers?: Array<{
		type: string;
		local: {
			name: string;
		};
		exported: {
			name: string;
		};
	}>;
}

export interface ExportAllDeclaration extends ASTNode {
	type: 'ExportAllDeclaration';
	source?: {
		value: string;
	};
}

export interface CallExpression extends ASTNode {
	type: 'CallExpression';
	callee?: {
		name: string;
	};
	arguments: Array<{
		type: string;
		value: string;
	}>;
}

export interface VariableDeclarator extends ASTNode {
	type: 'VariableDeclarator';
	id: {
		type: string;
		name?: string;
		properties?: Array<{
			type: string;
			key: {
				name: string;
			};
			value: {
				name: string;
			};
		}>;
	};
}

export interface Program extends ASTNode {
	type: 'Program';
	body: ASTNode[];
}

// Type definitions for dependencies
export interface Dependency {
	name?: string;
	default?: string;
	members?: Array<{
		name: string;
		alias: string;
	}>;
	star?: boolean;
	alias?: string;
}

export interface ParserOptions {
	filename?: string;
	sourceType?: 'module' | 'script';
}

/**
 * Traverse AST nodes recursively
 * @param node - AST node
 * @param visitor - Visitor function
 */
function traverse(node: ASTNode, visitor: (node: ASTNode) => void): void {
	if (!node || typeof node !== 'object') {
		return;
	}

	visitor(node);

	// Recursively traverse child nodes
	for (const key in node) {
		if (
			key === 'parent' ||
			key === 'leadingComments' ||
			key === 'trailingComments' ||
			key === 'start' ||
			key === 'end' ||
			key === 'raw'
		) {
			continue; // Skip parent references, comments and position info to avoid cycles
		}

		const child = node[key];
		if (Array.isArray(child)) {
			for (const item of child) {
				if (item && typeof item === 'object' && 'type' in item) {
					(item as ASTNode).parent = node; // Set parent reference
					traverse(item as ASTNode, visitor);
				}
			}
		} else if (child && typeof child === 'object' && 'type' in child) {
			(child as ASTNode).parent = node; // Set parent reference
			traverse(child as ASTNode, visitor);
		}
	}
}

/**
 * Determine appropriate filename for parsing context
 * @param code - Source code
 * @param options - Parse options
 * @returns - Appropriate filename
 */
function getFilename(code: string, options?: ParserOptions): string {
	if (options?.filename) {
		return options.filename;
	}

	// Detect if code contains TypeScript syntax
	const hasTypeScript =
		/:\s*\w+\s*[=;]|interface\s+\w+|type\s+\w+\s*=|enum\s+\w+/.test(code);
	// Detect if code contains JSX (including lowercase tags like <div>)
	const hasJSX = /<\w+[^>]*>/.test(code);

	if (hasTypeScript && hasJSX) {
		return 'module.tsx';
	}
	if (hasTypeScript) {
		return 'module.ts';
	}
	if (hasJSX) {
		return 'module.jsx';
	}
	return 'module.js';
}

/**
 * Extracts the dependencies of the supplied es6 module
 * @param code - Source code or AST
 * @param options - Parse options
 * @param cjs - Whether to include CommonJS require statements
 * @returns Array of dependencies
 */
export function detectiveFactory(
	code: string | ASTNode,
	options?: ParserOptions,
	cjs = false,
): Dependency[] {
	const dependencies: Dependency[] = [];

	if (!code) {
		throw new Error('src not given');
	}

	// Handle pre-parsed AST
	if (typeof code === 'object' && code.type === 'Program') {
		traverse(code, processNode);
		return dependencies;
	}

	// Parse code using oxc-parser
	let result: { program: ASTNode; errors?: unknown[] };
	try {
		// Determine appropriate filename for parsing context
		const filename = getFilename(code as string, options);
		result = parseSync(filename, code as string) as unknown as {
			program: ASTNode;
			errors?: unknown[];
		};
	} catch (error) {
		throw new Error(`Parse error: ${(error as Error).message}`);
	}

	if (result.errors && result.errors.length > 0) {
		// For now, we'll continue even with parse errors, similar to original behavior
		// console.warn('Parse errors:', result.errors);
	}

	// Traverse the AST
	traverse(result.program, processNode);

	return dependencies;

	function processNode(node: ASTNode): void {
		switch (node.type) {
			case 'ImportDeclaration': {
				const dep: Dependency = {};
				const importNode = node as ImportDeclaration;

				if (importNode.source?.value) {
					dep.name = importNode.source.value;
				}

				for (let i = 0; i < importNode.specifiers.length; i++) {
					const specifiersNode = importNode.specifiers[i];
					const specifiersType = specifiersNode.type;

					switch (specifiersType) {
						case 'ImportDefaultSpecifier':
							dep.default = specifiersNode.local.name;
							break;
						case 'ImportSpecifier':
							dep.members = dep.members || [];
							dep.members.push({
								name:
									specifiersNode.imported?.name || specifiersNode.local.name,
								alias: specifiersNode.local.name,
							});
							break;
						case 'ImportNamespaceSpecifier':
							dep.star = true;
							dep.alias = specifiersNode.local.name;
							break;
						default:
							return;
					}
				}
				dependencies.push(dep);
				break;
			}

			case 'ExportNamedDeclaration': {
				const dep: Dependency = {};
				const exportNode = node as ExportNamedDeclaration;

				if (exportNode.source?.value) {
					dep.name = exportNode.source.value;
				}

				if (exportNode.specifiers && exportNode.specifiers.length > 0) {
					for (let i = 0; i < exportNode.specifiers.length; i++) {
						const specifiersNode = exportNode.specifiers[i];
						const specifiersType = specifiersNode.type;

						switch (specifiersType) {
							case 'ExportSpecifier':
								dep.members = dep.members || [];
								dep.members.push({
									name: specifiersNode.local.name,
									alias: specifiersNode.exported.name,
								});
								break;
							default:
								return;
						}
					}
				}

				if (dep.name || dep.members) {
					dependencies.push(dep);
				}
				break;
			}

			case 'ExportAllDeclaration': {
				const exportAllNode = node as ExportAllDeclaration;
				if (exportAllNode.source?.value) {
					dependencies.push({
						name: exportAllNode.source.value,
					});
				}
				break;
			}

			case 'CallExpression': {
				if (cjs) {
					const callNode = node as CallExpression;
					if (callNode.callee?.name === 'require') {
						const args = callNode.arguments;
						if (args.length > 0 && args[0].type === 'Literal') {
							const dep: Dependency = {};
							dep.name = args[0].value;
							const parent = node.parent;

							// Check if this is a variable declaration
							if (parent && parent.type === 'VariableDeclarator') {
								const id = (parent as VariableDeclarator).id;
								if (id && id.type === 'Identifier') {
									dep.default = id.name;
								} else if (id && id.type === 'ObjectPattern') {
									dep.members = dep.members || [];
									const properties = id.properties;
									if (properties) {
										for (const property of properties) {
											if (property.type === 'Property') {
												const name = property.key.name;
												const alias = property.value.name;
												dep.members.push({ name, alias });
											}
										}
									}
								}
							}
							dependencies.push(dep);
						}
					}
				}
				break;
			}

			default:
				return;
		}
	}
}
