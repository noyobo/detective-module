import {
	type ASTNode,
	type Dependency,
	detectiveFactory,
	type ParserOptions,
} from './detectiveFactory';

function detectiveModule(
	code: string | ASTNode,
	options?: ParserOptions,
): Dependency[] {
	return detectiveFactory(code, options);
}

export default detectiveModule;
export { detectiveModule };

export function detectiveModuleAndRequire(
	code: string | ASTNode,
	options?: ParserOptions,
): Dependency[] {
	return detectiveFactory(code, options, true);
}

// Re-export types for convenience
export type { ASTNode, Dependency, ParserOptions } from './detectiveFactory';
