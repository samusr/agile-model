var Model = require("./models/Model");
var _a = require("./models/Relation"), Relation = _a.Relation, HAS_ONE = _a.HAS_ONE, HAS_MANY = _a.HAS_MANY, BELONGS_TO_ONE = _a.BELONGS_TO_ONE;
var _b = require("./utils").generateNames, generateModelName = _b.generateModelName, generateModelFilename = _b.generateModelFilename, generateTablename = _b.generateTablename, getInitialCamelCase = _b.getInitialCamelCase;
/**
 * This takes the models array and relation string specified in an agility.js file
 * and builds the model graph which is sent to the graph-implementer to create the files
 *
 * @param models The array of model names to create
 * @param relationString A string specifying the relationships between models
 */
// @ts-ignore: Can't find Relation
module.exports = function (modelNames, relationString) {
    var models = [];
    // Create the models from the modelNames array
    for (var _i = 0, modelNames_1 = modelNames; _i < modelNames_1.length; _i++) {
        var name = modelNames_1[_i];
        models.push(new Model(name));
    }
    // @ts-ignore: Can't find Relation
    var firstModelGraph = createModelGraph(models, relationString);
    // Analyze graph for circular references
    var resolvedModelGraph = resolveCircularReferences(firstModelGraph);
    // Merge both graphs
    var mergedGraph = mergeModelGraphs(firstModelGraph, resolvedModelGraph);
    // Determine what the reverse relations of the graph should be (i.e. If user HAS_MANY post, then post BELONGS_TO_ONE user)
    var reversedModelGraph = createModelGraphWithReversedRelations(mergedGraph);
    // Merge both original graphs to the reversed relationship graph
    mergedGraph = mergeModelGraphs(mergedGraph, reversedModelGraph);
    // Add models which were not mentioned in the relationString.
    // Since createModelGraph deals with the relations, those models are skipped
    var finalGraph = addMissingModels(mergedGraph, models);
    sortModelGraph(finalGraph);
    return finalGraph;
};
// @ts-ignore: Can't find Model, Relation
var createModelGraph = function (models, relationString) {
    if (relationString === void 0) { relationString = ""; }
    if (models.length == 0)
        return [];
    // Parse the relation string into an array
    var relations = relationString
        .trim()
        .split(",")
        .map(function (relation) { return relation.trim(); });
    // @ts-ignore: Can't find Model, Relation
    var graph = [];
    var _loop_1 = function (relation) {
        // Get the components of the relation. A relation is of this form "user HAS_MANY [post comment]"
        var components = relation.split(" ").map(function (component) { return component.replace(/\[|\]/g, ""); });
        // If the required length is not passed, terminate
        if (components.length < 3)
            throw "Malformed relation string \"" + relation + "\" detected. Relation string should be of the form 'MODEL TYPE DEPENDENTS' E.g. user HAS_MANY [post comment]";
        /**
         * After spliting and replacement, a relation should be of the form "user HAS_MANY post comment".
         * The dependent models are now from index 2 to the end
         */
        var modelName = generateModelName(getInitialCamelCase(components[0]).trim());
        var relationTypeString = components[1];
        var dependentsModelNames = components.slice(2).map(function (_m) { return generateModelName(getInitialCamelCase(_m).trim()); });
        // Check if a model with the same name exists in the models
        var model = models.filter(function (m) { return m.modelName == modelName; })[0];
        if (!model)
            throw "Cannot find relation model \"" + modelName + "\" in models array";
        var _loop_2 = function (modelName_1) {
            var dependencyModel = models.filter(function (m) { return m.modelName == modelName_1; })[0];
            if (!dependencyModel)
                throw "Cannot find relation model \"" + modelName_1 + "\" in models array";
            // Determine the relation type
            var relationType = void 0;
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
                    throw "Unknown forward relation \"" + relationTypeString + "\"";
            }
            // Create a new relation, if no existing relation a matching source model and relation type is found
            var modelRelationMatchFoundInGraph = false;
            for (var _i = 0, graph_1 = graph; _i < graph_1.length; _i++) {
                var existingRelation = graph_1[_i];
                if (existingRelation.sourceModel == model && existingRelation.relationType == relationType) {
                    existingRelation.adddependencyModel(dependencyModel);
                    modelRelationMatchFoundInGraph = true;
                    break;
                }
            }
            if (!modelRelationMatchFoundInGraph)
                graph.push(new Relation(model, dependencyModel, relationType));
        };
        // Create relations between the model and its dependents
        for (var _i = 0, dependentsModelNames_1 = dependentsModelNames; _i < dependentsModelNames_1.length; _i++) {
            var modelName_1 = dependentsModelNames_1[_i];
            _loop_2(modelName_1);
        }
    };
    for (var _i = 0, relations_1 = relations; _i < relations_1.length; _i++) {
        var relation = relations_1[_i];
        _loop_1(relation);
    }
    return graph;
};
// @ts-ignore: Can't find Model, Relation
var createModelGraphWithReversedRelations = function (modelGraph) {
    var reversedModelGraph = [];
    // Loop through each relation
    for (var _i = 0, modelGraph_1 = modelGraph; _i < modelGraph_1.length; _i++) {
        var relation = modelGraph_1[_i];
        var relationType = relation.relationType.getReverse();
        for (var _a = 0, _b = relation.dependencyModels; _a < _b.length; _a++) {
            var model = _b[_a];
            // Create a new relation, if no existing relation a matching source model and relation type is found
            var modelRelationMatchFoundInGraph = false;
            for (var _c = 0, reversedModelGraph_1 = reversedModelGraph; _c < reversedModelGraph_1.length; _c++) {
                var existingRelation = reversedModelGraph_1[_c];
                if (existingRelation.sourceModel == model && existingRelation.relationType == relationType) {
                    existingRelation.adddependencyModel(relation.sourceModel);
                    modelRelationMatchFoundInGraph = true;
                    break;
                }
            }
            if (!modelRelationMatchFoundInGraph)
                reversedModelGraph.push(new Relation(model, relation.sourceModel, relationType));
        }
    }
    return reversedModelGraph;
};
// @ts-ignore: Can't find Relation
var resolveCircularReferences = function (modelGraph) {
    // First, we need to get an array of one to one correspondence between model and dependent
    var flattenedGraph = flattenGraph(modelGraph);
    // Crosscheck each element with every other element and check for circular dependencies
    for (var _i = 0, flattenedGraph_1 = flattenedGraph; _i < flattenedGraph_1.length; _i++) {
        var object1 = flattenedGraph_1[_i];
        for (var _a = 0, flattenedGraph_2 = flattenedGraph; _a < flattenedGraph_2.length; _a++) {
            var object2 = flattenedGraph_2[_a];
            if (object1 == object2)
                continue;
            if (object1.source == object2.target && object1.target == object2.source) {
                object1.isCircularWith = object2.source;
                object2.isCircularWith = object1.source;
            }
        }
    }
    // Filter only the circularly referenced models
    flattenedGraph = flattenedGraph.filter(function (entry) { return entry.isCircularWith != null; });
    // Go through the original graph and remove relations having circular references
    for (var _b = 0, flattenedGraph_3 = flattenedGraph; _b < flattenedGraph_3.length; _b++) {
        var flatGraphRelation = flattenedGraph_3[_b];
        for (var _c = 0, modelGraph_2 = modelGraph; _c < modelGraph_2.length; _c++) {
            var modelGraphRelation = modelGraph_2[_c];
            if (flatGraphRelation.source == modelGraphRelation.sourceModel) {
                var spliceIndex = modelGraphRelation.dependencyModels.indexOf(flatGraphRelation.isCircularWith);
                if (spliceIndex != -1)
                    modelGraphRelation.dependencyModels.splice(spliceIndex, 1);
            }
        }
    }
    // Refine the objects in the flattened graph
    flattenedGraph = flattenedGraph.map(function (entry) {
        return {
            source: entry.source,
            target: entry.target,
            newModelName: entry.source.modelName + entry.target.modelName
        };
    });
    var newModelRelations = [];
    var newModelNames = [];
    // Add new models to array while checking for duplicates
    for (var _d = 0, flattenedGraph_4 = flattenedGraph; _d < flattenedGraph_4.length; _d++) {
        var entry = flattenedGraph_4[_d];
        var entryExistsInNewModels = false;
        for (var _e = 0, newModelRelations_1 = newModelRelations; _e < newModelRelations_1.length; _e++) {
            var relation = newModelRelations_1[_e];
            if (entry.source == relation.target || entry.target == relation.source)
                entryExistsInNewModels = true;
        }
        if (!entryExistsInNewModels) {
            newModelRelations.push(entry);
            if (newModelNames.indexOf(entry.source.modelName) == -1)
                newModelNames.push(entry.source.modelName);
            if (newModelNames.indexOf(entry.target.modelName) == -1)
                newModelNames.push(entry.target.modelName);
            newModelNames.push(entry.newModelName);
        }
    }
    // Begin the relation string translation for source models
    var newRelationString = newModelRelations.reduce(function (acc, relation) { return acc + " " + relation.source.modelName + " HAS_MANY " + relation.newModelName + ","; }, "");
    // Continue the relation string translation for dependent models
    newRelationString = newModelRelations.reduce(function (acc, relation) { return acc + " " + relation.target.modelName + " HAS_MANY " + relation.newModelName + ","; }, newRelationString);
    // Trim and add beginning and ending brackets
    newRelationString = newRelationString.trim();
    newRelationString = "[" + newRelationString.substring(0, newRelationString.length - 1) + "]";
    var newModels = newModelNames.map(function (name) { return new Model(name); });
    return createModelGraph(newModels, newRelationString);
};
// @ts-ignore: Can't find Relation
var flattenGraph = function (graph) {
    var flattenedGraph = [];
    for (var _i = 0, graph_2 = graph; _i < graph_2.length; _i++) {
        var relation = graph_2[_i];
        for (var _a = 0, _b = relation.dependencyModels; _a < _b.length; _a++) {
            var model = _b[_a];
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
var mergeModelGraphs = function () {
    var graphs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        graphs[_i] = arguments[_i];
    }
    // @ts-ignore: Can't find Relation
    var finalGraph = [];
    for (var _a = 0, graphs_1 = graphs; _a < graphs_1.length; _a++) {
        var graph = graphs_1[_a];
        for (var _b = 0, graph_3 = graph; _b < graph_3.length; _b++) {
            var relation = graph_3[_b];
            var modelRelationMatchFoundInFinalGraph = false;
            for (var _c = 0, finalGraph_1 = finalGraph; _c < finalGraph_1.length; _c++) {
                var finalRelation = finalGraph_1[_c];
                if (finalRelation.sourceModel.modelName == relation.sourceModel.modelName &&
                    finalRelation.relationType.type == relation.relationType.type) {
                    for (var _d = 0, _e = relation.dependencyModels; _d < _e.length; _d++) {
                        var model = _e[_d];
                        finalRelation.adddependencyModel(model);
                    }
                    modelRelationMatchFoundInFinalGraph = true;
                    break;
                }
            }
            if (!modelRelationMatchFoundInFinalGraph)
                finalGraph.push(relation);
        }
    }
    return finalGraph;
};
// @ts-ignore: Can't find Relation
var addMissingModels = function (graph, models) {
    var missingModels = [];
    for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
        var model = models_1[_i];
        var modelExistsInGraph = false;
        for (var _a = 0, graph_4 = graph; _a < graph_4.length; _a++) {
            var relation = graph_4[_a];
            if (model.modelName == relation.sourceModel.modelName) {
                modelExistsInGraph = true;
                break;
            }
        }
        if (!modelExistsInGraph)
            missingModels.push(model);
    }
    for (var _b = 0, missingModels_1 = missingModels; _b < missingModels_1.length; _b++) {
        var model = missingModels_1[_b];
        graph.push(new Relation(model, null, HAS_ONE));
    }
    return graph;
};
// @ts-ignore: Can't find Relation
var sortModelGraph = function (graph) {
    // The sorting is necessary to prevent migration issues when using knex.
    // This is issue is where model A depends on model B but is still created BEFORE model B
    var sortedModelGraph = [];
    var relationsWithDependents = graph.filter(function (relation) { return relation.relationType.type != BELONGS_TO_ONE.type; });
    var relationsWithDependencies = graph.filter(function (relation) { return relation.relationType.type == BELONGS_TO_ONE.type; });
    var _loop_3 = function () {
        var relation = relationsWithDependents.pop();
        // If source model has dependencies, put it back in the array and continue
        var belongsToEntries = relationsWithDependencies.filter(function (rel) { return relation.sourceModel.modelName == rel.sourceModel.modelName; });
        var relationHasDependencies = belongsToEntries.length != 0;
        if (relationHasDependencies) {
            // Check if all the dependencies are in the sorted graph
            var allDependenciesAreInSortedGraph = true;
            for (var _i = 0, belongsToEntries_1 = belongsToEntries; _i < belongsToEntries_1.length; _i++) {
                var belongsToEntry = belongsToEntries_1[_i];
                for (var _a = 0, _b = belongsToEntry.dependencyModels; _a < _b.length; _a++) {
                    var dependencyModel = _b[_a];
                    var dependencyIsInSortedGraph = false;
                    for (var _c = 0, sortedModelGraph_1 = sortedModelGraph; _c < sortedModelGraph_1.length; _c++) {
                        var sortedRelation = sortedModelGraph_1[_c];
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
            }
            else {
                // ... else push it back to the relationsWithDependents array
                relationsWithDependents.unshift(relation);
            }
        }
        else {
            // If relation does not have dependencies, add it to the sorted graph
            sortedModelGraph.push(relation);
        }
    };
    while (relationsWithDependents.length != 0) {
        _loop_3();
    }
    sortedModelGraph = sortedModelGraph.concat(relationsWithDependencies);
    console.log(sortedModelGraph.toString());
    return sortedModelGraph;
};
