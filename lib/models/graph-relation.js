const GraphModel = require("./graph-model"); // eslint-disable-line no-unused-vars

class GraphRelationType {
	constructor(/**@type {string}*/ type) {
		/**@type {string}*/
		this.type = type;
	}

	getReverse() {
		switch (this.type) {
			case "HAS_ONE":
			case "HAS_MANY":
				return new GraphRelationType("BELONGS_TO_ONE");
			case "BELONGS_TO_ONE":
				return new GraphRelationType("HAS_MANY");
			default:
				throw `Unknown type [${this.type}]`;
		}
	}
}

class GraphRelation {
	constructor(/**@type {GraphModel}*/ sourceModel, /**@type {Array<GraphModel>}*/ dependencyModels, /**@type {GraphRelationType}*/ relationType) {
		this.sourceModel = sourceModel;
		this.relationType = relationType;
		this.dependencyModels = dependencyModels;
	}

	addDependencyModel(/**@type {GraphModel}*/ model) {
		for (let existingModel of this.dependencyModels) {
			if (existingModel.modelName == model.modelName) return;
		}

		this.dependencyModels.push(model);
	}

	toString() {
		const sourceModelName = this.sourceModel.modelName;
		const relationTypeName = this.relationType.type;
		let dependencyModelNames = this.dependencyModels.reduce((acc, model) => `${acc} ${model.modelName},`, "");
		dependencyModelNames = dependencyModelNames.trim();
		dependencyModelNames = dependencyModelNames.substring(0, dependencyModelNames.length - 1);

		return `Source: ${sourceModelName}\nType: ${relationTypeName}\nDependencies: [ ${dependencyModelNames} ]\n`;
	}
}

const HAS_ONE = new GraphRelationType("HAS_ONE");
const HAS_MANY = new GraphRelationType("HAS_MANY");
const BELONGS_TO_ONE = new GraphRelationType("BELONGS_TO_ONE");

module.exports = { GraphRelation, GraphRelationType, HAS_ONE, HAS_MANY, BELONGS_TO_ONE };
