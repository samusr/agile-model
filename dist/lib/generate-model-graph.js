var Model = require("./models/Model");
var _a = require("./models/Relation"), Relation = _a.Relation, HAS_ONE = _a.HAS_ONE, HAS_MANY = _a.HAS_MANY;
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
    // Add models which were not mentioned in the relationString.
    // Since createModelGraph deals with the relations, those models are skipped
    var finalGraph = addMissingModels(mergedGraph, models);
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
            var dependentModel = models.filter(function (m) { return m.modelName == modelName_1; })[0];
            if (!dependentModel)
                throw "Cannot find relation model \"" + modelName_1 + "\" in models array";
            // Determine the relation type
            var relationType = void 0;
            switch (relationTypeString) {
                case "HAS_ONE":
                    relationType = HAS_ONE;
                    break;
                case "HAS_MANY":
                    relationType = HAS_MANY;
                    break;
                // case "MANY_TO_MANY":
                // 	relationType = MANY_TO_MANY;
                // 	break;
                default:
                    throw "Unknown forward relation \"" + relationTypeString + "\"";
            }
            // Create a new relation, if no existing relation a matching source model and relation type is found
            var modelRelationMatchFoundInGraph = false;
            for (var _i = 0, graph_1 = graph; _i < graph_1.length; _i++) {
                var existingRelation = graph_1[_i];
                if (existingRelation.sourceModel == model && existingRelation.relationType == relationType) {
                    existingRelation.addDependentModel(dependentModel);
                    modelRelationMatchFoundInGraph = true;
                    break;
                }
            }
            if (!modelRelationMatchFoundInGraph)
                graph.push(new Relation(model, dependentModel, relationType));
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
// @ts-ignore: Can't find Relation
var resolveCircularReferences = function (modelGraph) {
    // First, we need to get an array of one to one correspondence between model and dependent
    var flattenedGraph = [];
    for (var _i = 0, modelGraph_1 = modelGraph; _i < modelGraph_1.length; _i++) {
        var relation = modelGraph_1[_i];
        for (var _a = 0, _b = relation.dependentModels; _a < _b.length; _a++) {
            var model = _b[_a];
            flattenedGraph.push({
                source: relation.sourceModel,
                type: relation.relationType.type,
                target: model,
                isCircularWith: null
            });
        }
    }
    // Crosscheck each element with every other element and check for circular dependencies
    for (var _c = 0, flattenedGraph_1 = flattenedGraph; _c < flattenedGraph_1.length; _c++) {
        var object1 = flattenedGraph_1[_c];
        for (var _d = 0, flattenedGraph_2 = flattenedGraph; _d < flattenedGraph_2.length; _d++) {
            var object2 = flattenedGraph_2[_d];
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
    for (var _e = 0, flattenedGraph_3 = flattenedGraph; _e < flattenedGraph_3.length; _e++) {
        var flatGraphRelation = flattenedGraph_3[_e];
        for (var _f = 0, modelGraph_2 = modelGraph; _f < modelGraph_2.length; _f++) {
            var modelGraphRelation = modelGraph_2[_f];
            if (flatGraphRelation.source == modelGraphRelation.sourceModel) {
                var spliceIndex = modelGraphRelation.dependentModels.indexOf(flatGraphRelation.isCircularWith);
                if (spliceIndex != -1)
                    modelGraphRelation.dependentModels.splice(spliceIndex, 1);
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
    for (var _g = 0, flattenedGraph_4 = flattenedGraph; _g < flattenedGraph_4.length; _g++) {
        var entry = flattenedGraph_4[_g];
        var entryExistsInNewModels = false;
        for (var _h = 0, newModelRelations_1 = newModelRelations; _h < newModelRelations_1.length; _h++) {
            var relation = newModelRelations_1[_h];
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
    var newRelationString = newModelRelations.reduce(function (acc, relation) { return acc + " " + relation.source.modelName + " HAS_MANY " + relation.newModelName + ","; }, "");
    newRelationString = newModelRelations.reduce(function (acc, relation) { return acc + " " + relation.target.modelName + " HAS_MANY " + relation.newModelName + ","; }, newRelationString);
    newRelationString = newRelationString.trim();
    newRelationString = "[" + newRelationString.substring(0, newRelationString.length - 1) + "]";
    var newModels = newModelNames.map(function (name) { return new Model(name); });
    return createModelGraph(newModels, newRelationString);
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
        for (var _b = 0, graph_2 = graph; _b < graph_2.length; _b++) {
            var relation = graph_2[_b];
            var modelRelationMatchFoundInFinalGraph = false;
            for (var _c = 0, finalGraph_1 = finalGraph; _c < finalGraph_1.length; _c++) {
                var finalRelation = finalGraph_1[_c];
                if (finalRelation.sourceModel.modelName == relation.sourceModel.modelName &&
                    finalRelation.relationType.type == relation.relationType.type) {
                    for (var _d = 0, _e = relation.dependentModels; _d < _e.length; _d++) {
                        var model = _e[_d];
                        finalRelation.addDependentModel(model);
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
        for (var _a = 0, graph_3 = graph; _a < graph_3.length; _a++) {
            var relation = graph_3[_a];
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
