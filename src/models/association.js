const _ = require("lodash");

/**
 * Represents a pair of models where one HAS_MANY of another.
 * This class makes the creation of the "find-by-relation-id.js"
 * database service file more convenient.
 * @param lModel The model which HAS_MANY of the other
 * @param rModel The model which BELONGS_TO_ONE of the other
 */
function Association(lModel, rModel) {
	// If User HAS_MANY Post...
	this.lModel = lModel; // 'User' is the lModel
	this.rModel = rModel; // 'Post' is the rModel
	this.lModelVarName = `${_.camelCase(lModel.singular_tablename)}Id`; // This would be 'userId'
	this.dbRelationFileName = `find-by-${lModel.singular_tablename.replace(/_/g, "-")}-id.js`; // This would be 'find-by-user-id.js'
}

module.exports = { Association };
