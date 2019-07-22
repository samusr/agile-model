const _ = require("lodash");
const prettier = require("prettier");
const folder = require("./folder");
const file = require("./file");
const path = require("./path");

function arrayToStringShim() {
	Array.prototype.toString = function() {
		let str = "";

		for (let obj in this) if (this.hasOwnProperty(obj)) str += `${this[obj]}\n`;

		return str;
	};
}

function updateDBIndexFile() {
	const dbFolderPath = path.rootDir() + "src/server/services/db/";
	const modelDBGroups = folder.read(dbFolderPath, "folder");
	const modelIndexImports = modelDBGroups.map(group => `const ${_.camelCase(group)} = require("./${group}");`);
	const modelIndexVarNames = modelDBGroups.map(group => `${_.camelCase(group)},`);
	const content = prettier.format(`${modelIndexImports.join("\n")}\n\nmodule.exports = {\n${modelIndexVarNames.join("\n")}};`, prettierConfig);
	file.create(dbFolderPath + "index.js");
	file.write(dbFolderPath + "index.js", content);
}

const prettierConfig = {
	parser: "babel",
	printWidth: 150,
	useTabs: true,
	tabWidth: 4,
	semi: true,
	singleQuote: false,
	trailingComma: "none"
};

module.exports = { arrayToStringShim, updateDBIndexFile, prettierConfig };
