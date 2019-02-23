/**
 * Represents a relation between models
 */
module.exports = class Relation {
	constructor(type, model) {
		this.type = type;
		this.model = model;
	}

	/**
	 * Returns a relation type which is the reverse of the current type
	 * @returns {String}
	 */
	getReversedType() {
		switch (this.type) {
			case "HAS_ONE":
			case "HAS_MANY":
				return "BELONGS_TO_ONE";
			case "BELONGS_TO_ONE":
				return "HAS_MANY";
			default:
				throw new Error(`Unknown reverse type for: ${this.type}`);
		}
	}
};
