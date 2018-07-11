const _ = require("lodash");
const pluralize = require("pluralize");

/**
 * This takes the models array and relation string specified in an agility.config.js file
 * and builds the model graph which is sent to the graph-implementer to create the files
 *
 * @param models The array of model names to create
 * @param relationString A string specifying the relationships between models
 */

module.exports = function(models = [], relationString = "") {
    const modelGraph = [];
    processModelInfo(modelGraph, models);
    processRelationString(modelGraph, relationString);

    return modelGraph;
};

function processModelInfo(modelGraph, models = []) {
    for (let model of models) {
        modelGraph.push({
            name: getActualModelName(model),
            file: getModelFileName(model),
            table: getTableName(model),
            relations: []
        });
    }
}

function processRelationString(modelGraph, relationString = "") {
    if (relationString == "") return;

    let foundRelations = relationString
        .trim()
        .split(",")
        .map(relation => relation.trim());

    for (let foundRelation of foundRelations) {
        let relationComponents = foundRelation.split(" ").map(component => component.replace(/\[|\]/g, ""));

        let sourceModelName = getActualModelName(relationComponents[0]);
        let relationType = relationComponents[1];
        let destModelNames = relationComponents.slice(2).map(_m => getActualModelName(_m));

        // TODO: Process MANY_TO_MANY relations

        // Match relation to model in modelGraph
        for (let model of modelGraph) {
            // If match is found in forwards direction, push destModel into matched relations
            if (model.name == sourceModelName) {
                for (let destModelName of destModelNames) {
                    model.relations.push({
                        model: getActualModelName(destModelName),
                        file: getModelFileName(destModelName),
                        join: [`${model.table}.id`, `${getTableName(destModelName)}.${model.name.toLowerCase()}_id`],
                        relation: relationType
                    });
                }
            }

            // If match is found in reversed direction, push sourceModel into matched relations with a reversed relationType
            for (let destModelName of destModelNames) {
                if (model.name == destModelName) {
                    model.relations.push({
                        model: getActualModelName(sourceModelName),
                        file: getModelFileName(sourceModelName),
                        join: [`${model.table}.${sourceModelName.toLowerCase()}_id`, `${getTableName(sourceModelName)}.id`],
                        relation: getReversedRelationType(relationType)
                    });
                }
            }
        }
    }
}

function getActualModelName(modelName) {
    let lowercasedModel = pluralize.singular(modelName.trim()).toLowerCase();
    return _.capitalize(lowercasedModel[0]) + _.camelCase(lowercasedModel.replace("-", "_")).substring(1);
}

function getModelFileName(modelName) {
    let lowercasedModel = pluralize.singular(modelName.trim()).toLowerCase();
    return `${lowercasedModel}.js`;
}

function getTableName(modelName) {
    let lowercasedModel = pluralize.singular(modelName.trim()).toLowerCase();
    return pluralize(lowercasedModel)
        .replace("-", "_")
        .toLowerCase();
}

function getReversedRelationType(relationType) {
    switch (relationType) {
        case "HAS_ONE":
        case "HAS_MANY":
            return "BELONGS_TO_ONE";
        default:
            throw new Error(`Unsupported relation type [${relationType}]`);
    }
}
