const _ = require("lodash");
const { singular } = require("pluralize");
const { namesGenerator } = require("../utils");

/**
 * Represents a model that will help in
 * creating the file structure of a new project
 */
class Model {
    constructor(name, relations = []) {
        this.name = namesGenerator.generateModelName(name);
        this.filename = namesGenerator.generateModelFilename(name);
        this.tablename = namesGenerator.generateTablename(name);
        this.singular_tablename = singular(this.tablename);
        this.relations = relations;
    }

    /**
     * Adds a new relation to the models relation array
     * @param {Relation} relation The relation object
     */
    addRelation(relation) {
        if (!relation) return;
        this.relations.push(relation);
    }
}

/**
 * Represents a relation between models
 */
class Relation {
    constructor(type, model) {
        this.type = type;
        this.model = model;
    }

    /**
     * Returns a relation type which is the reverse of the current type
     * @returns {String}
     */
    getReversedType() {
        switch (this.type) {
            case "HAS_ONE":
            case "HAS_MANY":
                return "BELONGS_TO_ONE";
            case "BELONGS_TO_ONE":
                return "HAS_MANY";
            default:
                throw new Error(`Unknown reverse type for: ${this.type}`);
        }
    }
}

/**
 * Contains all parameters required to create the
 * find-by-relation-id.js database service file
 */
class BelongsToOnePair {
    constructor(hasManyModel, belongsToOneModel) {
        // If User HAS_MANY Post...
        this.hasManyModel = hasManyModel; // 'User' is the hasManyModel
        this.belongsToOneModel = belongsToOneModel; // 'Post' is the belongsToOneModel
        this.hasManyModelVarName = `${_.camelCase(hasManyModel.singular_tablename)}Id`; // This would be 'userId'
        this.dbRelationFileName = `find-by-${hasManyModel.singular_tablename.replace(/_/g, "-")}-id.js`; // This would be 'find-by-user-id.js'
    }
}

module.exports = { Model, Relation, BelongsToOnePair };
