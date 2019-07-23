function Relation(type, model) {
	if (!Relation.validTypes.includes(type))
		throw new Error(`Unknown relation type - ${type}. Relation type must be one of ${Relation.validTypes.join(", ")}`);

	this.type = type;
	this.model = model;

	if (["HAS_ONE", "HAS_MANY"].includes(this.type)) {
		this.reverseType = "BELONGS_TO_ONE";
	} else this.reverseType = "HAS_MANY";
}

Relation.validTypes = ["HAS_ONE", "HAS_MANY", "BELONGS_TO_ONE"];

module.exports = { Relation };
