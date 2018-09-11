module.exports = (() => {
	const {
		generateNames: { generateModelName, generateModelFilename, generateTablename, getInitialCamelCase }
	} = require("../utils");

	class Model {
		modelName: string;
		modelFilename: string;
		tablename: string;

		constructor(name: string) {
			const _name = getInitialCamelCase(name).trim();
			this.modelName = generateModelName(_name);
			this.modelFilename = generateModelFilename(_name);
			this.tablename = generateTablename(_name);
		}
	}

	return Model;
})();
