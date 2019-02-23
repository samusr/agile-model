// eslint-disable-next-line no-unused-vars
const Relation = require("./relation");
const { singular } = require("pluralize");
const { namesGenerator } = require("../../utils");

/**
 * Represents a model class within the new project
 */
module.exports = class Model {
	constructor(name) {
		this.name = namesGenerator.generateModelName(name);
		this.filename = namesGenerator.generateModelFilename(name);
		this.tablename = namesGenerator.generateModelTablename(name);
		this.singular_tablename = singular(this.tablename);
		this.relations = [];
	}

	/**
	 * Adds a new relation to the models relation array
	 * @param {Relation} relation The relation object
	 */
	addRelation(relation) {
		if (!relation) return;
		this.relations.push(relation);
	}
};
