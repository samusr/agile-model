const { Model, Relation } = require("../models");

module.exports.parse = function(names = [], relationString = "") {
	if (names.length == 0 || relationString == "") return [];

	const models = [];
	for (const name of names) {
		models.push(new Model(name));
	}

	createModelRelations(models, relationString);
	resolveCircularDependencies(models);
	generateReversedRelations(models);
	sortModels(models);
	return models;
};

/**
 * Parses the relation string and creates the appropriate relations for each model
 * @param {Model[]} models The list of models
 * @param {String} relationString The relation string
 */
function createModelRelations(models, relationString) {
	const relations = relationString.split(",").map(r => r.trim());

	// A relation looks like "User HAS_MANY Post" or "User HAS_MANY [Post Comment]"
	for (const relation of relations) {
		const params = Relation.parse(relation);
		let srcExists = false;

		for (const model of models) {
			if (model.name == params.src) {
				for (const target of params.targets) {
					const match = models.filter(m => m.name == target)[0];
					if (match) model.relations.push(new Relation(params.type, match));
				}

				srcExists = true;
				break;
			}
		}

		if (!srcExists) throw new Error(`Model does not exist - '${params.src}' in relation '${relation}'`);
	}
}

/**
 * Resolves circular dependencies between models by introducing
 * a bridge model between the src model and its dependent models
 * @param {Model[]} models The list of models
 */
const resolveCircularDependencies = models => {
	const circularDependencies = [];

	// Compare a model to all of its related models which also depends on it
	for (const lModel of models) {
		for (const [relationIndex, relation] of lModel.relations.entries()) {
			const rModel = relation.model;
			const rModelCircularRelation = rModel.relations.filter(r => r.model == lModel && r.type)[0];

			// If circular dependency exists...
			if (rModelCircularRelation) {
				// ...splice it from both models...
				lModel.relations.splice(relationIndex, 1);
				rModel.relations.splice(rModel.relations.indexOf(rModelCircularRelation), 1);
				// ... and create a dependency pair for them
				circularDependencies.push({ lModel, rModel });
			}
		}
	}

	// For each dependencyPair, create a bridge model and link to the models of the pair
	for (const dep of circularDependencies) {
		const bridgeModel = new Model(dep.lModel.name + dep.rModel.name);
		dep.lModel.relations.push(new Relation("HAS_MANY", bridgeModel));
		dep.rModel.relations.push(new Relation("HAS_MANY", bridgeModel));
		models.push(bridgeModel);
	}
};

/**
 * Generates a set of relations which are the reverse of the current set.
 * E.g. If a User HAS_ONE Post, the corresponding reverse relation would be Post BELONGS_TO_ONE User.
 * @param {Model[]} models The array of models
 */
const generateReversedRelations = models => {
	for (const model of models) {
		for (const relation of model.relations) {
			if (relation.type == "HAS_ONE" || relation.type == "HAS_MANY") {
				relation.model.relations.push(new Relation(relation.reverseType, model));
			}
		}
	}
};

/**
 * Sorts the models by level of dependence. This means the models are
 * arranged according to number of dependencies. At the end of this sort,
 * all models will have their dependents placed first before them
 * @param {Model[]} models The array of models
 */
const sortModels = models => {
	const sortedModels = [];

	while (sortedModels.length != models.length) {
		for (const model of models) {
			const allDependenciesExist = model.relations.reduce((v, r) => {
				if (r.type == "BELONGS_TO_ONE" && !sortedModels.includes(r.model)) return false;
				return v && true;
			}, true);

			if (allDependenciesExist && !sortedModels.includes(model)) {
				sortedModels.push(model);
			}
		}
	}

	models.splice(0, models.length);
	models.push(...sortedModels);
};
