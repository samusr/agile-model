function Relation(model, type) {
	const validTypes = ["HAS_ONE", "HAS_MANY", "BELONGS_TO_ONE"];
	if (!validTypes.includes(type)) throw new Error(`Unknown relation type - ${this.type}`);

	this.model = model;
	this.type = type;

	if (["HAS_ONE", "HAS_MANY"].includes(this.type)) {
		this.reverseType = "BELONGS_TO_ONE";
	} else this.reverseType = "HAS_MANY";
}

module.exports = { Relation };
