const oxc = require("oxc-parser");

/**
 * Traverse AST nodes recursively
 * @param {Object} node - AST node
 * @param {Function} visitor - Visitor function
 */
function traverse(node, visitor) {
  if (!node || typeof node !== "object") {
    return;
  }

  visitor(node);

  // Recursively traverse child nodes
  for (const key in node) {
    if (
      key === "parent" ||
      key === "leadingComments" ||
      key === "trailingComments" ||
      key === "start" ||
      key === "end" ||
      key === "raw"
    ) {
      continue; // Skip parent references, comments and position info to avoid cycles
    }

    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((item) => {
        if (item && typeof item === "object") {
          item.parent = node; // Set parent reference
          traverse(item, visitor);
        }
      });
    } else if (child && typeof child === "object" && child.type) {
      child.parent = node; // Set parent reference
      traverse(child, visitor);
    }
  }
}

/**
 * Determine appropriate filename for parsing context
 * @param {string} code - Source code
 * @param {Object} options - Parse options
 * @returns {string} - Appropriate filename
 */
function getFilename(code, options) {
  if (options?.filename) {
    return options.filename;
  }

  // Detect if code contains TypeScript syntax
  const hasTypeScript =
    /:\s*\w+\s*[=;]|interface\s+\w+|type\s+\w+\s*=|enum\s+\w+/.test(code);
  // Detect if code contains JSX (including lowercase tags like <div>)
  const hasJSX = /<\w+[^>]*>/.test(code);

  if (hasTypeScript && hasJSX) {
    return "module.tsx";
  } else if (hasTypeScript) {
    return "module.ts";
  } else if (hasJSX) {
    return "module.jsx";
  } else {
    return "module.js";
  }
}

/**
 * Extracts the dependencies of the supplied es6 module
 * @param code
 * @param options
 * @return {*[]}
 */
function detectiveFactory(code, options, cjs = false) {
  const dependencies = [];

  if (!code) {
    throw new Error("src not given");
  }

  // Handle pre-parsed AST
  if (typeof code === "object" && code.type === "Program") {
    traverse(code, processNode);
    return dependencies;
  }

  // Parse code using oxc-parser
  let result;
  try {
    // Determine appropriate filename for parsing context
    const filename = getFilename(code, options);
    result = oxc.parseSync(filename, code);
  } catch (error) {
    throw new Error(`Parse error: ${error.message}`);
  }

  if (result.errors && result.errors.length > 0) {
    // For now, we'll continue even with parse errors, similar to original behavior
    // console.warn('Parse errors:', result.errors);
  }

  // Traverse the AST
  traverse(result.program, processNode);

  return dependencies;

  function processNode(node) {
    switch (node.type) {
      case "ImportDeclaration":
        var dep = {};
        if (node.source && node.source.value) {
          dep.name = node.source.value;
        }
        for (var i = 0; i < node.specifiers.length; i++) {
          var specifiersNode = node.specifiers[i];
          var specifiersType = specifiersNode.type;
          switch (specifiersType) {
            case "ImportDefaultSpecifier":
              dep.default = specifiersNode.local.name;
              break;
            case "ImportSpecifier":
              dep.members = dep.members || [];
              dep.members.push({
                name: specifiersNode.imported.name,
                alias: specifiersNode.local.name,
              });
              break;
            case "ImportNamespaceSpecifier":
              dep.star = true;
              dep.alias = specifiersNode.local.name;
              break;
            default:
              return;
          }
        }
        dependencies.push(dep);
        break;

      case "ExportNamedDeclaration":
        var dep = {};
        if (node.source && node.source.value) {
          dep.name = node.source.value;
        }
        if (node.specifiers && node.specifiers.length > 0) {
          for (var i = 0; i < node.specifiers.length; i++) {
            var specifiersNode = node.specifiers[i];
            var specifiersType = specifiersNode.type;
            switch (specifiersType) {
              case "ExportSpecifier":
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

      case "ExportAllDeclaration":
        if (node.source && node.source.value) {
          dependencies.push({
            name: node.source.value,
          });
        }
        break;

      case "CallExpression":
        if (cjs && node.callee && node.callee.name === "require") {
          var args = node.arguments;
          if (args.length > 0 && args[0].type === "Literal") {
            var dep = {};
            dep.name = args[0].value;
            var parent = node.parent;

            // Check if this is a variable declaration
            if (parent && parent.type === "VariableDeclarator") {
              var id = parent.id;
              if (id && id.type === "Identifier") {
                dep.default = id.name;
              } else if (id && id.type === "ObjectPattern") {
                dep.members = dep.members || [];
                var properties = id.properties;
                properties.forEach(function (property) {
                  if (property.type === "Property") {
                    var name = property.key.name;
                    var alias = property.value.name;
                    dep.members.push({ name, alias });
                  }
                });
              }
            }
            dependencies.push(dep);
          }
        }
        break;

      default:
        return;
    }
  }
}

function detectiveModule(code, options) {
  return detectiveFactory(code, options);
}

module.exports = detectiveModule;

module.exports.detectiveModule = detectiveModule;

module.exports.detectiveModuleAndRequire = function detectiveModuleAndRequire(
  code,
  options
) {
  return detectiveFactory(code, options, true);
};
