const GraphModel = require("./models/graph-model");
// eslint-disable-next-line no-unused-vars
const { GraphRelation, GraphRelationType, HAS_ONE, HAS_MANY, BELONGS_TO_ONE } = require("./models/graph-relation");
const {
	generateNames: { generateModelName, getInitialCamelCase }
} = require("./utils");

/**
 * This takes the models array and relation string specified in an agility.js file
 * and builds the model graph which is sent to the graph-implementer to create the files
 *
 * @param models The array of model names to create
 * @param relationString The string specifying the relationships between models
 */

module.exports = (/**@type {Array<string>}*/ modelNames, /**@type {string}*/ relationString) => {
	/**@type {Array<string>}*/
	const models = [];

	// Create the models from the modelNames array
	for (let name of modelNames) {
		models.push(new GraphModel(name));
	}

	const firstModelGraph = createModelGraph(models, relationString);

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
	let finalGraph = addMissingModels(mergedGraph, models);

	sortModelGraph(finalGraph);

	return finalGraph;
};

const createModelGraph = (/**@type {Array<GraphModel>}*/ models, /**@type {string}*/ relationString) => {
	if (models.length == 0) return [];

	// Parse the relation string into an array
	const relations = relationString
		.trim()
		.split(",")
		.map(relation => relation.trim());

	/**@type {Array<GraphRelation>}*/
	const modelGraph = [];

	for (const relation of relations) {
		// Get the components of the relation. A relation is of this form "user HAS_MANY [post comment]"
		const components = relation.split(" ").map(component => component.replace(/\[|\]/g, ""));

		// If the required length is not passed, terminate
		if (components.length < 3)
			throw `Invalid relation string "${relation}" detected. Relation string should be of the form 'MODEL TYPE DEPENDENTS' E.g. user HAS_MANY [post comment]`;

		/* 
			After spliting and replacement, a relation should be of the form "user HAS_MANY post comment".
			The dependent models are now from index 2 to the end
		*/

		/**@type {string}*/
		const modelName = generateModelName(getInitialCamelCase(components[0]).trim());
		const relationTypeString = components[1];
		const dependentsModelNames = components.slice(2).map(_m => generateModelName(getInitialCamelCase(_m).trim()));

		// Check if a model with the same name exists in the models
		const model = models.filter(m => m.modelName == modelName)[0];
		if (!model) throw `Cannot find relation model "${modelName}" in models array`;

		// Create relations between the model and its dependents
		for (const modelName of dependentsModelNames) {
			const dependencyModel = models.filter(m => m.modelName == modelName)[0];
			if (!dependencyModel) throw `"${modelName}" does not exist in models array`;

			// Determine the relation type
			/**@type {GraphRelationType}*/
			let relationType;

			switch (relationTypeString) {
				case HAS_ONE.type:
					relationType = HAS_ONE;
					break;
				case HAS_MANY.type:
					relationType = HAS_MANY;
					break;
				case BELONGS_TO_ONE.type:
					relationType = BELONGS_TO_ONE;
					break;
				default:
					throw `Unknown forward relation "${relationTypeString}"`;
			}

			// Create a new relation, if no existing relation a matching source model and relation type is found
			let modelRelationMatchFoundInGraph = false;

			for (const existingRelation of modelGraph) {
				if (existingRelation.sourceModel == model && existingRelation.relationType == relationType) {
					existingRelation.addDependencyModel(dependencyModel);
					modelRelationMatchFoundInGraph = true;
					break;
				}
			}

			if (!modelRelationMatchFoundInGraph) modelGraph.push(new GraphRelation(model, [dependencyModel], relationType));
		}
	}

	return modelGraph;
};

const createModelGraphWithReversedRelations = (/**@type {Array<GraphRelation>}*/ modelGraph) => {
	/**@type {Array<GraphRelation>}*/
	const reversedModelGraph = [];

	// Loop through each relation
	for (const relation of modelGraph) {
		let relationType = relation.relationType.getReverse();

		for (const model of relation.dependencyModels) {
			// Create a new relation, if no existing relation a matching source model and relation type is found
			let modelRelationMatchFoundInGraph = false;

			for (const existingRelation of reversedModelGraph) {
				if (existingRelation.sourceModel == model && existingRelation.relationType == relationType) {
					existingRelation.addDependencyModel(relation.sourceModel);
					modelRelationMatchFoundInGraph = true;
					break;
				}
			}

			if (!modelRelationMatchFoundInGraph) reversedModelGraph.push(new GraphRelation(model, [relation.sourceModel], relationType));
		}
	}

	return reversedModelGraph;
};

const resolveCircularReferences = (/**@type {Array<GraphRelation>}*/ modelGraph) => {
	// First, we need to get an array of one to one correspondence between model and dependent
	const flattenedGraph = flattenGraph(modelGraph);

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

	// Filter pairs with circularly references
	const graphPairsWithCircularReferences = flattenedGraph.filter(entry => entry.isCircularWith != null);

	// Go through the original graph and remove dependency models having circular references with source model
	for (const graphPair of graphPairsWithCircularReferences) {
		for (const modelGraphRelation of modelGraph) {
			if (graphPair.source == modelGraphRelation.sourceModel) {
				const spliceIndex = modelGraphRelation.dependencyModels.indexOf(graphPair.isCircularWith);

				if (spliceIndex != -1) modelGraphRelation.dependencyModels.splice(spliceIndex, 1);
			}
		}
	}

	// Refine the objects in the graphPairsWithCircularReferences array.
	// Since our solution is to create new models from the models with circular references,
	// we add a "newModelName" property which is a concatenation of the names of both models
	const refinedGraphPairs = graphPairsWithCircularReferences.map(entry => {
		return {
			source: entry.source,
			target: entry.isCircularWith,
			newModelName: entry.source.modelName + entry.isCircularWith.modelName
		};
	});

	// We would like to reuse the createModelGraph function. This means we will need an string array of model names
	// and a relation string connecting the models
	const newModelNames = [];
	const newRelations = [];

	// Add new models to array while checking for duplicates
	for (const graphPair of refinedGraphPairs) {
		// Since we don't want duplicates in our new relations, we need to make sure that
		// neither the graphPair's source or targets are in any existing relation
		let entryExistsInNewRelations = false;

		for (const relation of newRelations) {
			if (graphPair.source == relation.target || graphPair.target == relation.source) {
				entryExistsInNewRelations = true;
				break;
			}
		}

		if (!entryExistsInNewRelations) {
			newRelations.push(graphPair);

			// Also push the new model to be added into the newModelNames
			newModelNames.push(graphPair.newModelName);

			// Add the source and target model names to the newModelNames if they don't already exist
			if (!newModelNames.includes(graphPair.source.modelName)) newModelNames.push(graphPair.source.modelName);

			if (!newModelNames.includes(graphPair.target.modelName)) newModelNames.push(graphPair.target.modelName);
		}
	}

	// Begin the relation string translation for source models.
	// Both the source and target models now have a "HAS_MANY" relation with the new model name
	let newRelationString = newRelations.reduce((acc, relation) => `${acc} ${relation.source.modelName} HAS_MANY ${relation.newModelName},`, "");
	newRelationString = newRelations.reduce(
		(acc, relation) => `${acc} ${relation.target.modelName} HAS_MANY ${relation.newModelName},`,
		newRelationString
	);
	newRelationString = newRelationString.trim();
	newRelationString = "[" + newRelationString.substring(0, newRelationString.length - 1) + "]";

	const newModels = newModelNames.map(name => new GraphModel(name));

	return createModelGraph(newModels, newRelationString);
};

const mergeModelGraphs = (/** @type {Array<Array<GraphRelation>>} */ ...graphs) => {
	/**@type {Array<GraphRelation>}*/
	const finalGraph = [];

	for (const graph of graphs) {
		for (const relation of graph) {
			let modelRelationMatchFoundInFinalGraph = false;

			// If an existing relation is found in finalGraph, add the dependencyModels to the finalRelation...
			for (const finalRelation of finalGraph) {
				if (
					finalRelation.sourceModel.modelName == relation.sourceModel.modelName &&
					finalRelation.relationType.type == relation.relationType.type
				) {
					for (let model of relation.dependencyModels) {
						finalRelation.addDependencyModel(model);
					}

					modelRelationMatchFoundInFinalGraph = true;
					break;
				}
			}

			// ...else add the whole relation to the finalGraph array
			if (!modelRelationMatchFoundInFinalGraph) finalGraph.push(relation);
		}
	}

	return finalGraph;
};

const addMissingModels = (/**@type {Array<GraphRelation>}*/ graph, /**@type {Array<GraphModel>}*/ models) => {
	// Detenmin if fthe model is absent in the graph
	for (const model of models) {
		let modelExistsInGraph = false;

		for (const relation of graph) {
			if (model.modelName == relation.sourceModel.modelName) {
				modelExistsInGraph = true;
				break;
			}
		}

		// ...then add it, if it is
		if (!modelExistsInGraph) {
			graph.push(new GraphRelation(model, [], HAS_ONE));
		}
	}

	return graph;
};

const sortModelGraph = (/**@type {Array<GraphRelation>}*/ graph) => {
	// The sorting is necessary to prevent migration issues when using knex.
	// This is issue is where model A depends on model B but is still created BEFORE model B
	/**@type {Array<GraphRelation>}*/
	let sortedModelGraph = [];

	// First, we separate the relations into the ones with dependencies and the ones without
	// Because we've run the resolve circular dependencies, we are certain that there'll be at least,
	// one relation without dependencies
	const relationsWithDependents = graph.filter(relation => relation.relationType.type != BELONGS_TO_ONE.type);
	const relationsWithDependencies = graph.filter(relation => relation.relationType.type == BELONGS_TO_ONE.type);

	while (relationsWithDependents.length != 0) {
		const relation = relationsWithDependents.pop();

		// If source model has dependencies...
		const belongsToEntries = relationsWithDependencies.filter(rel => relation.sourceModel.modelName == rel.sourceModel.modelName);
		const relationHasDependencies = belongsToEntries.length != 0;

		// ...check the sortedModelGraph and see if all its dependencies exist
		if (relationHasDependencies) {
			let allDependenciesAreInSortedGraph = true;

			for (const belongsToEntry of belongsToEntries) {
				for (const dependencyModel of belongsToEntry.dependencyModels) {
					let dependencyIsInSortedGraph = false;

					for (const sortedRelation of sortedModelGraph) {
						if (dependencyModel.modelName == sortedRelation.sourceModel.modelName) {
							dependencyIsInSortedGraph = true;
							break;
						}
					}

					if (!dependencyIsInSortedGraph) {
						allDependenciesAreInSortedGraph = false;
						break;
					}
				}
			}

			// If all dependencies exist, add relation to sorted graph...
			if (allDependenciesAreInSortedGraph) {
				sortedModelGraph.push(relation);
			} else {
				// ... else push it back to the relationsWithDependents array and continue
				relationsWithDependents.unshift(relation);
			}
		} else {
			// At this point, the relation does not have dependencies so we can add it to the sorted graph
			sortedModelGraph.push(relation);
		}
	}

	// When the loop is complete, we are sure that all relationsWithDependencies have their dependencies sorted out
	// and we can also add them to the sortedModelGraph
	sortedModelGraph = sortedModelGraph.concat(relationsWithDependencies);

	return sortedModelGraph;
};

const flattenGraph = (/**@type {Array<GraphRelation>}*/ graph) => {
	let flattenedGraph = [];

	for (const relation of graph) {
		for (const model of relation.dependencyModels) {
			flattenedGraph.push({
				source: relation.sourceModel,
				type: relation.relationType.type,
				target: model,
				/**@type {GraphModel}*/ isCircularWith: null
			});
		}
	}

	return flattenedGraph;
};
