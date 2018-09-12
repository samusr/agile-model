const Model = require("./models/Model");
const { Relation, HAS_ONE, HAS_MANY, BELONGS_TO_ONE } = require("./models/Relation");
const {
	generateNames: { generateModelName, generateModelFilename, generateTablename, getInitialCamelCase }
} = require("./utils");

/**
 * This takes the models array and relation string specified in an agility.js file
 * and builds the model graph which is sent to the graph-implementer to create the files
 *
 * @param models The array of model names to create
 * @param relationString A string specifying the relationships between models
 */

// @ts-ignore: Can't find Relation
module.exports = (modelNames: Array<string>, relationString: string): Array<Relation> => {
	const models = [];

	// Create the models from the modelNames array
	for (let name of modelNames) {
		models.push(new Model(name));
	}

	// @ts-ignore: Can't find Relation
	const firstModelGraph: Array<Relation> = createModelGraph(models, relationString);

	// Analyze graph for circular references
	const resolvedModelGraph = resolveCircularReferences(firstModelGraph);

	// Merge both graphs
	let mergedGraph = mergeModelGraphs(firstModelGraph, resolvedModelGraph);

	// Determine what the reverse relations of the graph should be (i.e. If user HAS_MANY post, then post BELONGS_TO_ONE user)
	const reversedModelGraph = createModelGraphWithReversedRelations(mergedGraph);

	// Merge both original graphs to the reversed relationship graph
	mergedGraph = mergeModelGraphs(mergedGraph, reversedModelGraph);

	// Add models which were not mentioned in the relationString.
	// Since createModelGraph deals with the relations, those models are skipped
	const finalGraph = addMissingModels(mergedGraph, models);

	return finalGraph;
};

// @ts-ignore: Can't find Model, Relation
const createModelGraph = (models: Array<Model>, relationString: string = ""): Array<Relation> => {
	if (models.length == 0) return [];

	// Parse the relation string into an array
	const relations: Array<string> = relationString
		.trim()
		.split(",")
		.map(relation => relation.trim());

	// @ts-ignore: Can't find Model, Relation
	const graph: Array<Relation> = [];

	for (const relation of relations) {
		// Get the components of the relation. A relation is of this form "user HAS_MANY [post comment]"
		const components = relation.split(" ").map(component => component.replace(/\[|\]/g, ""));

		// If the required length is not passed, terminate
		if (components.length < 3)
			throw `Malformed relation string "${relation}" detected. Relation string should be of the form 'MODEL TYPE DEPENDENTS' E.g. user HAS_MANY [post comment]`;

		/**
		 * After spliting and replacement, a relation should be of the form "user HAS_MANY post comment".
		 * The dependent models are now from index 2 to the end
		 */

		const modelName = generateModelName(getInitialCamelCase(components[0]).trim());
		const relationTypeString = components[1];
		const dependentsModelNames = components.slice(2).map(_m => generateModelName(getInitialCamelCase(_m).trim()));

		// Check if a model with the same name exists in the models
		const model = models.filter(m => m.modelName == modelName)[0];
		if (!model) throw `Cannot find relation model "${modelName}" in models array`;

		// Create relations between the model and its dependents
		for (const modelName of dependentsModelNames) {
			const dependencyModel = models.filter(m => m.modelName == modelName)[0];
			if (!dependencyModel) throw `Cannot find relation model "${modelName}" in models array`;

			// Determine the relation type
			let relationType;
			switch (relationTypeString) {
				case "HAS_ONE":
					relationType = HAS_ONE;
					break;
				case "HAS_MANY":
					relationType = HAS_MANY;
					break;
				case "BELONGS_TO_ONE":
					relationType = BELONGS_TO_ONE;
					break;
				default:
					throw `Unknown forward relation "${relationTypeString}"`;
			}

			// Create a new relation, if no existing relation a matching source model and relation type is found
			let modelRelationMatchFoundInGraph = false;

			for (const existingRelation of graph) {
				if (existingRelation.sourceModel == model && existingRelation.relationType == relationType) {
					existingRelation.adddependencyModel(dependencyModel);
					modelRelationMatchFoundInGraph = true;
					break;
				}
			}

			if (!modelRelationMatchFoundInGraph) graph.push(new Relation(model, dependencyModel, relationType));
		}
	}

	return graph;
};

// @ts-ignore: Can't find Model, Relation
const createModelGraphWithReversedRelations = (modelGraph: Array<Relation>): Array<Relation> => {
	const reversedModelGraph = [];

	// Loop through each relation
	for (const relation of modelGraph) {
		let relationType = relation.relationType.getReverse();

		for (const model of relation.dependencyModels) {
			// Create a new relation, if no existing relation a matching source model and relation type is found
			let modelRelationMatchFoundInGraph = false;

			for (const existingRelation of reversedModelGraph) {
				if (existingRelation.sourceModel == model && existingRelation.relationType == relationType) {
					existingRelation.adddependencyModel(relation.sourceModel);
					modelRelationMatchFoundInGraph = true;
					break;
				}
			}

			if (!modelRelationMatchFoundInGraph) reversedModelGraph.push(new Relation(model, relation.sourceModel, relationType));
		}
	}

	return reversedModelGraph;
};

// @ts-ignore: Can't find Relation
const resolveCircularReferences = (modelGraph: Array<Relation>): Array<Relation> => {
	// First, we need to get an array of one to one correspondence between model and dependent
	let flattenedGraph = flattenGraph(modelGraph);

	// Crosscheck each element with every other element and check for circular dependencies
	for (const object1 of flattenedGraph) {
		for (const object2 of flattenedGraph) {
			if (object1 == object2) continue;

			if (object1.source == object2.target && object1.target == object2.source) {
				object1.isCircularWith = object2.source;
				object2.isCircularWith = object1.source;
			}
		}
	}

	// Filter only the circularly referenced models
	flattenedGraph = flattenedGraph.filter(entry => entry.isCircularWith != null);

	// Go through the original graph and remove relations having circular references
	for (const flatGraphRelation of flattenedGraph) {
		for (const modelGraphRelation of modelGraph) {
			if (flatGraphRelation.source == modelGraphRelation.sourceModel) {
				let spliceIndex = modelGraphRelation.dependencyModels.indexOf(flatGraphRelation.isCircularWith);

				if (spliceIndex != -1) modelGraphRelation.dependencyModels.splice(spliceIndex, 1);
			}
		}
	}

	// Refine the objects in the flattened graph
	flattenedGraph = flattenedGraph.map(entry => {
		return {
			source: entry.source,
			target: entry.target,
			newModelName: entry.source.modelName + entry.target.modelName
		};
	});

	const newModelRelations = [];
	const newModelNames = [];

	// Add new models to array while checking for duplicates
	for (const entry of flattenedGraph) {
		let entryExistsInNewModels = false;

		for (const relation of newModelRelations) {
			if (entry.source == relation.target || entry.target == relation.source) entryExistsInNewModels = true;
		}

		if (!entryExistsInNewModels) {
			newModelRelations.push(entry);

			if (newModelNames.indexOf(entry.source.modelName) == -1) newModelNames.push(entry.source.modelName);

			if (newModelNames.indexOf(entry.target.modelName) == -1) newModelNames.push(entry.target.modelName);

			newModelNames.push(entry.newModelName);
		}
	}

	// Begin the relation string translation for source models
	let newRelationString = newModelRelations.reduce((acc, relation) => `${acc} ${relation.source.modelName} HAS_MANY ${relation.newModelName},`, "");

	// Continue the relation string translation for dependent models
	newRelationString = newModelRelations.reduce(
		(acc, relation) => `${acc} ${relation.target.modelName} HAS_MANY ${relation.newModelName},`,
		newRelationString
	);

	// Trim and add beginning and ending brackets
	newRelationString = newRelationString.trim();
	newRelationString = "[" + newRelationString.substring(0, newRelationString.length - 1) + "]";

	const newModels = newModelNames.map(name => new Model(name));

	return createModelGraph(newModels, newRelationString);
};

// @ts-ignore: Can't find Relation
const flattenGraph = (graph: Array<Relation>): Array<Relation> => {
	let flattenedGraph = [];

	for (const relation of graph) {
		for (const model of relation.dependencyModels) {
			flattenedGraph.push({
				source: relation.sourceModel,
				type: relation.relationType.type,
				target: model,
				isCircularWith: null
			});
		}
	}

	return flattenedGraph;
};

// @ts-ignore: Can't find Relation
const mergeModelGraphs = (...graphs: Array<Relation>): Array<Relation> => {
	// @ts-ignore: Can't find Relation
	const finalGraph: Array<Relation> = [];

	for (const graph of graphs) {
		for (const relation of graph) {
			let modelRelationMatchFoundInFinalGraph = false;

			for (const finalRelation of finalGraph) {
				if (
					finalRelation.sourceModel.modelName == relation.sourceModel.modelName &&
					finalRelation.relationType.type == relation.relationType.type
				) {
					for (let model of relation.dependencyModels) {
						finalRelation.adddependencyModel(model);
					}

					modelRelationMatchFoundInFinalGraph = true;
					break;
				}
			}

			if (!modelRelationMatchFoundInFinalGraph) finalGraph.push(relation);
		}
	}

	return finalGraph;
};

// @ts-ignore: Can't find Relation
const addMissingModels = (graph: Array<Relation>, models: Array<Models>): Array<Relation> => {
	const missingModels = [];

	for (const model of models) {
		let modelExistsInGraph = false;

		for (const relation of graph) {
			if (model.modelName == relation.sourceModel.modelName) {
				modelExistsInGraph = true;
				break;
			}
		}

		if (!modelExistsInGraph) missingModels.push(model);
	}

	for (const model of missingModels) {
		graph.push(new Relation(model, null, HAS_ONE));
	}

	return graph;
};

// @ts-ignore: Can't find Relation
const sortModelGraph = (graph: Array<Relation>): Array<Relation> => {
	// The sorting is necessary to prevent migration issues when using knex.
	// Models with least dependencies
};
