const _ = require("lodash");
const pluralize = require("pluralize");

/**
 * This takes the models array and relation string specified in an agility.js file
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
        if (model.startsWith("/") || model.startsWith("\\")) {
            model = model.substring(1);
        }

        let pathComponents = model.split(/[/|\\]/g).map(pathComponent => pathComponent.trim());
        let modelName = pathComponents[pathComponents.length - 1];

        // To avoid duplication of folder names, if the pathsComponents array has a size greater than 1
        // and the last path is the same as its preceeding element, remove it from the pathsComponents array
        pathComponents[pathComponents.length - 1] = getModelFileName(modelName).split(".")[0];
        if (pathComponents.length > 1 && pathComponents[pathComponents.length - 1] == pathComponents[pathComponents.length - 2]) {
            console.log({ before: pathComponents });
            pathComponents.splice(pathComponents.length - 1, 1);
            console.log({ after: pathComponents });
        }

        modelGraph.push({
            name: getActualModelName(modelName),
            file: getModelFileName(modelName),
            table: getTableName(modelName),
            route: pathComponents,
            view: pathComponents,
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
                        table: getTableName(destModelName),
                        name: relationType == "BELONGS_TO_ONE" ? pluralize.singular(getTableName(destModelName)) : getTableName(destModelName),
                        join: [`${model.table}.id`, `${getTableName(destModelName)}.${pluralize.singular(model.table)}_id`],
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
                        table: getTableName(sourceModelName),
                        name:
                            getReversedRelationType(relationType) == "BELONGS_TO_ONE"
                                ? pluralize.singular(getTableName(sourceModelName))
                                : getTableName(sourceModelName),
                        join: [`${model.table}.${pluralize.singular(getTableName(sourceModelName))}_id`, `${getTableName(sourceModelName)}.id`],
                        relation: getReversedRelationType(relationType)
                    });
                }
            }
        }
    }
}

function getActualModelName(modelName) {
    let lowercasedModel = pluralize.singular(getInitialCamelCase(modelName).trim()).toLowerCase();
    return _.capitalize(lowercasedModel[0]) + _.camelCase(lowercasedModel.replace("-", "_")).substring(1);
}

function getModelFileName(modelName) {
    let lowercasedModel = pluralize.singular(getInitialCamelCase(modelName).trim()).toLowerCase();
    return `${lowercasedModel}.js`;
}

function getTableName(modelName) {
    let lowercasedModel = pluralize.singular(getInitialCamelCase(modelName).trim()).toLowerCase();
    return pluralize(lowercasedModel)
        .replace("-", "_")
        .toLowerCase();
}

function getInitialCamelCase(str) {
    let temp = str.charAt(0);

    for (let i = 1; i < str.length; i++) {
        if (str.charAt(i).toLowerCase() != str.charAt(i)) {
            temp = temp + "-" + str.charAt(i).toUpperCase();
        } else {
            temp = temp + str.charAt(i);
        }
    }

    return temp;
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
