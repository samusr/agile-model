function Relation(type, model) {
	if (!Relation.isValid(type)) throw new Error(`Unknown relation type - ${type}. Relation type must be one of ${Relation.validTypes.join(", ")}`);

	this.type = type;
	this.model = model;

	if (["HAS_ONE", "HAS_MANY"].includes(this.type)) {
		this.reverseType = "BELONGS_TO_ONE";
	} else this.reverseType = "HAS_MANY";
}

Relation.validTypes = ["HAS_ONE", "HAS_MANY", "BELONGS_TO_ONE"];

Relation.isValid = function(type) {
	return Relation.validTypes.includes(type);
};

Relation.parse = function(relationString) {
	const components = relationString.split(" ");
	const src = components[0];
	const type = components[1];
	const targets = components.slice(2).map(t => t.trim().replace(/\[|\]/g, ""));

	if (!Relation.isValid(type)) throw new Error(`Unknown relation type - ${type} in ${relationString}`);

	return { src, type, targets };
};

module.exports = { Relation };
