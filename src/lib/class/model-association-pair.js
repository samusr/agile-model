const _ = require("lodash");
// eslint-disable-next-line no-unused-vars
const Model = require("./model");

/**
 * Represents a pair of models where one HAS_MANY of another.
 * This class makes the creation of the "find-by-relation-id.js" database service file
 * more convenient
 */
module.exports = class ModelAssociationPair {
	/**
	 * Creates a model associated pair
	 * @param {Model} hasManyModel The model which HAS_MANY of the other
	 * @param {Model} belongsToOneModel The model which BELONGS_TO_ONE of the other
	 */
	constructor(hasManyModel, belongsToOneModel) {
		// If User HAS_MANY Post...
		this.hasManyModel = hasManyModel; // 'User' is the hasManyModel
		this.belongsToOneModel = belongsToOneModel; // 'Post' is the belongsToOneModel
		this.hasManyModelVarName = `${_.camelCase(hasManyModel.singular_tablename)}Id`; // This would be 'userId'
		this.dbRelationFileName = `find-by-${hasManyModel.singular_tablename.replace(/_/g, "-")}-id.js`; // This would be 'find-by-user-id.js'
	}
};
