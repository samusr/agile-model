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

function readAgilityConfig() {
	const agilityPath = path.resolve("agility.js");
	if (!path.exists(agilityPath)) throw new Error("Cannot find 'agility.js' config file. Run 'agile-model init' first");
	const config = require(agilityPath);
	return config;
}

function updateIndex(pathToFolder, mode) {
	if (!mode) throw new Error("updateIndex requires mode to be 'file' or 'folder'");
	const indexPath = path.resolve(pathToFolder);
	const groups = folder
		.read(indexPath, mode)
		.map(group => group.split(".")[0])
		.filter(group => group != "index");
	const groupIndexImports = groups.map(group => `const ${_.camelCase(group)} = require("./${group}");`);
	const groupIndexVarNames = groups.map(group => `${_.camelCase(group)},`);
	const content = prettier.format(
		`
        ${groupIndexImports.join("\n")}
        \n\n
        module.exports = {\n
            ${groupIndexVarNames.join("\n")}
        };`,
		prettierConfig
	);
	file.create(indexPath + "/index.js");
	file.write(indexPath + "/index.js", content);
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

function formattedTime() {
	const d = new Date();
	const dateComponent = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
	const timeComponent = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}_${pad(d.getMilliseconds())}`;
	return dateComponent + timeComponent;
}

function pad(str) {
	return str.toString().padStart(2, "0");
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

module.exports = { arrayToStringShim, readAgilityConfig, updateIndex, searchCodeTree, formattedTime, pad, prettierConfig };
