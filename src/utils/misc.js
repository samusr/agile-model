const _ = require("lodash");
const prettier = require("prettier");
const folder = require("./folder");
const file = require("./file");
const path = require("./path");

function arrayToStringShim() {
	Array.prototype.toString = function() {
		let str = "";

		for (let obj in this) {
			if (this.hasOwnProperty(obj)) {
				str += `${this[obj]}\n`;
			}
		}

		return str;
	};
}

function updateDBIndexFile() {
	const dbFolderPath = path.resolve("src/server/services/db/");
	const modelDBGroups = folder.read(dbFolderPath, "folder");
	const modelIndexImports = modelDBGroups.map(group => `const ${_.camelCase(group)} = require("./${group}");`);
	const modelIndexVarNames = modelDBGroups.map(group => `${_.camelCase(group)},`);
	const content = prettier.format(`${modelIndexImports.join("\n")}\n\nmodule.exports = {\n${modelIndexVarNames.join("\n")}};`, prettierConfig);
	file.create(dbFolderPath + "index.js");
	file.write(dbFolderPath + "index.js", content);
}

function searchCodeTree(rootNode, type, evalFn, depth = 0) {
	if (!rootNode) return [];

	const foundNodes = [];

	if (Array.isArray(rootNode)) {
		for (const node of rootNode) {
			foundNodes.push(...searchCodeTree(node, type, evalFn, depth + 1));
		}
	} else if (typeof rootNode == "object") {
		if (rootNode.type != type || !evalFn(rootNode)) {
			for (const key in rootNode) {
				if (typeof rootNode[key] == "object") {
					foundNodes.push(...searchCodeTree(rootNode[key], type, evalFn, depth + 1));
				}
			}
		} else foundNodes.push(rootNode);
	}

	return foundNodes;
}

const prettierConfig = {
	parser: "babel",
	printWidth: 150,
	useTabs: true,
	tabWidth: 4,
	semi: true,
	singleQuote: false,
	bracketSpacing: true,
	trailingComma: "none"
};

module.exports = { arrayToStringShim, updateDBIndexFile, searchCodeTree, prettierConfig };
