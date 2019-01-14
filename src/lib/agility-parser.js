const { Model, Relation } = require("./models");

/**
 * Accepts an array of model names and string relation (usually from the agility.js file)
 * and generates an model array in the order of which should be created first.
 *
 * @param {string[]} modelNames The array of models names
 * @param {string} relationString The string indicating the relationships between the models
 */
const parse = (modelNames, relationString) => {
    let models = createInitialModelArray(modelNames);
    processModelRelations(models, relationString);
    resolveCircularDependencies(models);
    generateReversedRelations(models);
    sortModels(models);
    return models;
};

/**
 * Creates the initial models array from the model names
 *
 * @param {string[]} modelNames The array of models names
 */
const createInitialModelArray = modelNames => {
    const modelsArray = [];
    for (const modelName of modelNames) modelsArray.push(new Model(modelName));
    return modelsArray;
};

/**
 * Processes the relation string and adds the relations to each model in the models array
 *
 * @param {Model[]} models The array of models
 * @param {string} relationString The string indicating the relationships between the models
 */
const processModelRelations = (models, relationString) => {
    const relationEntries = relationString.split(",").map(r => r.trim());
    const stage1Models = [];

    for (const relationEntry of relationEntries) {
        const relationEntryComponents = relationEntry.split(" ");
        const src = relationEntryComponents[0];
        const type = relationEntryComponents[1];
        const targets = relationEntryComponents.slice(2).map(t => t.trim().replace(/\[|\]/g, ""));

        if (!isRelationTypeIsValid(type)) throw new Error(`Unknown relation type: ${type}`);

        stage1Models.push({ src, type, targets });
    }

    // Merge stage1Models with common source models
    const stage2Models = [];
    for (const stage1Model of stage1Models) {
        let modelExistsInStage2 = false;

        for (const stage2Model of stage2Models) {
            if (stage1Model.src == stage2Model.src) {
                // Add all the targets of stageModel1 to stageModel2's relation
                for (const target of stage1Model.targets) {
                    stage2Model.relations.push({
                        type: stage1Model.type,
                        target
                    });
                }

                modelExistsInStage2 = true;
                break;
            }
        }

        if (!modelExistsInStage2) {
            stage2Models.push({
                src: stage1Model.src,
                relations: stage1Model.targets.map(target => ({
                    type: stage1Model.type,
                    target
                }))
            });
        }
    }

    // Match stage2Models data with corresponding model in models array
    for (const model of models) {
        for (const stage2Model of stage2Models) {
            if (model.name.toLowerCase() == stage2Model.src.toLowerCase()) {
                // Find matching related model in models array
                for (const stage2ModelRelation of stage2Model.relations) {
                    for (const targetModel of models) {
                        if (targetModel.name.toLowerCase() == stage2ModelRelation.target.toLowerCase()) {
                            model.addRelation(new Relation(stage2ModelRelation.type, targetModel));
                            break;
                        }
                    }
                }
                break;
            }
        }
    }
};

/**
 * Resolves circular dependencies between models by introducing a bridge model between the dependent models
 *
 * @param {Model[]} models The array of models
 */
const resolveCircularDependencies = models => {
    const dependencyPairs = [];

    // Compare a model to all of its related models relation
    // models (not a mistake) to see which one also depends on it
    for (const model of models) {
        for (const relation of model.relations) {
            const relationIndex = model.relations.indexOf(relation);

            for (const relatedModelRelation of relation.model.relations) {
                const relatedModelRelationIndex = relation.model.relations.indexOf(relatedModelRelation);

                if (relatedModelRelation.model == model) {
                    model.relations.splice(relationIndex, 1);
                    relation.model.relations.splice(relatedModelRelationIndex, 1);

                    dependencyPairs.push({
                        firstModel: model,
                        secondModel: relation.model
                    });
                }
            }
        }
    }

    // For each model-pair entry in the dependencyPairs,
    // create a bridging model and link to the models of the pair
    for (const pair of dependencyPairs) {
        const bridgeModelName = pair.firstModel.name + pair.secondModel.name;
        const bridgeModel = new Model(bridgeModelName);
        pair.firstModel.relations.push(new Relation("HAS_MANY", bridgeModel));
        pair.secondModel.relations.push(new Relation("HAS_MANY", bridgeModel));
        models.push(bridgeModel);
    }
};

/**
 * Generates a set of relations which are the reverse of the current set.
 * E.g. If a User HAS_ONE Post, the corresponding reverse relation would be Post BELONGS_TO_ONE User.
 *
 * @param {Model[]} models The array of models
 */
const generateReversedRelations = models => {
    for (const model of models) {
        for (const relation of model.relations) {
            if (relation.type == "HAS_ONE" || relation.type == "HAS_MANY") {
                relation.model.relations.push(new Relation(relation.getReversedType(), model));
            }
        }
    }
};

/**
 * Sorts the models by level of dependence. This means the models which do not have dependencies are placed
 * first before the dependent models
 *
 * @param {Model[]} models The array of models
 */
const sortModels = models => {
    const sortedModels = [];

    while (sortedModels.length != models.length) {
        for (const model of models) {
            let allDependenciesExist = true;

            for (const relation of model.relations) {
                if (relation.type == "BELONGS_TO_ONE" && !sortedModels.includes(relation.model)) {
                    allDependenciesExist = false;
                }
            }

            if (allDependenciesExist && !sortedModels.includes(model)) {
                sortedModels.push(model);
            }
        }
    }

    models.splice(0, models.length);
    models.push(...sortedModels);
};

/**
 * Determines whether or not a relation type is valid
 */
const isRelationTypeIsValid = type => ["HAS_ONE", "HAS_MANY", "BELONGS_TO_ONE"].includes(type);

module.exports = { parse };
