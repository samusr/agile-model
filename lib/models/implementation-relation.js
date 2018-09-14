const { GraphRelation } = require("./graph-relation"); // eslint-disable-line no-unused-vars

/**
 * This is an version of GraphRelation which holds relations
 * of the same sourceModel
 */
class ImplementationRelation {
	constructor(/**@type {Array<GraphRelation>}*/ graphRelations) {
		try {
			this.sourceModel = graphRelations[0].sourceModel;
			this.graphRelations = graphRelations;
		} catch (err) {
			throw "graphRelations must be an array";
		}
	}

	addRelation(/**@type {GraphRelation}*/ graphRelation) {
		if (this.graphRelations.includes(graphRelation) || graphRelation.sourceModel.modelName != this.sourceModel.modelName) return;
		this.graphRelations.push(graphRelation);
	}
}

module.exports = ImplementationRelation;
