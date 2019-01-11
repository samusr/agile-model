const { namesGenerator } = require("./utils");

/**
 * Represents a model that will help in
 * creating the file structure of a new project
 */
class Model {
    constructor(name, relations = []) {
        this.name = namesGenerator.generateModelName(name);
        this.filename = namesGenerator.generateModelFilename(name);
        this.tablename = namesGenerator.generateTablename(name);
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

module.exports = { Model, Relation };
