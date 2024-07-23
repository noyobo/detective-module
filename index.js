const Walker = require("node-source-walk");
const t = require("@babel/types");

function detectiveFactory(code, options, cjs = false) {
  const walker = new Walker({
    plugins: [
      "jsx",
      "typescript",
      "doExpressions",
      "objectRestSpread",
      ["decorators", { decoratorsBeforeExport: true }],
      "classProperties",
      "exportDefaultFrom",
      "exportNamespaceFrom",
      "asyncGenerators",
      "functionBind",
      "functionSent",
      "dynamicImport",
      "optionalChaining",
      "nullishCoalescingOperator",
    ],
    allowHashBang: true,
    sourceType: "module",
    ...options,
  });

  const dependencies = [];

  if (!code) {
    throw new Error("src not given");
  }

  walker.walk(code, function (node) {
    let dep = {}; // Initialize dep at the top of the switch
    switch (node.type) {
      case "ImportDeclaration":
        if (node.source && node.source.value) {
          dep.name = node.source.value;
        }
        node.specifiers.forEach((specifier) => {
          const { type, local, imported } = specifier;
          switch (type) {
            case "ImportDefaultSpecifier":
              dep.default = local.name;
              break;
            case "ImportSpecifier":
              dep.members = dep.members || [];
              dep.members.push({
                name: imported.name,
                alias: local.name,
              });
              break;
            case "ImportNamespaceSpecifier":
              dep.star = true;
              dep.alias = local.name;
              break;
          }
        });
        dependencies.push(dep);
        break;
      case "ExportNamedDeclaration":
        if (node.source && node.source.value) {
          dep.name = node.source.value;
          dependencies.push(dep);
        }
        node.specifiers.forEach((specifier) => {
          const { type, local, exported } = specifier;
          if (type === "ExportSpecifier") {
            dep.members = dep.members || [];
            dep.members.push({
              name: local.name,
              alias: exported.name,
            });
          }
        });
        break;
      case "ExportAllDeclaration":
        if (node.source && node.source.value) {
          dependencies.push({ name: node.source.value });
        }
        break;
      case "CallExpression":
        if (cjs && node.callee.name === "require") {
          const [arg] = node.arguments;
          dep.name = arg.value;
          const { id } = node.parent;
          if (t.isIdentifier(id)) {
            dep.default = id.name;
          } else if (t.isObjectPattern(id)) {
            dep.members = dep.members || [];
            id.properties.forEach((property) => {
              const { key, value } = property;
              dep.members.push({ name: key.name, alias: value.name });
            });
          }
          dependencies.push(dep);
        }
        break;
    }
  });

  return dependencies;
}

function detectiveModule(code, options) {
  return detectiveFactory(code, options);
}

module.exports = detectiveModule;
module.exports.detectiveModule = detectiveModule;
module.exports.detectiveModuleAndRequire = function detectiveModuleAndRequire(code, options) {
  return detectiveFactory(code, options, true);
};
