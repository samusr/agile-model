const {
	generateNames: { generateModelName, generateModelFilename, generateTablename, getInitialCamelCase }
} = require("../utils");

module.exports = class GraphModel {
	constructor(/**@type {string}*/ name) {
		/**@type {string}*/
		const _name = getInitialCamelCase(name).trim();

		/**@type {string}*/
		this.modelName = generateModelName(_name);
		this.modelFilename = generateModelFilename(_name);
		this.tablename = generateTablename(_name);
	}
};
