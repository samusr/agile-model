const { singular } = require("pluralize");
const { name } = require("../utils");

function Model(n) {
	this.name = name.modelName(n);
	this.filename = name.modelFilename(n);
	this.tablename = name.modelTablename(n);
	/*  singular_tablename is useful when we are creating
    'find-by-%RELATION_NAME%-id.js' files if this model 
    is on the 'MANY' side of a 'HAS_MANY' relation
    I.e. If a 'User HAS_MANY Post', then a Post should
    have a 'find-by-user-id.js' db file */
	this.singular_tablename = singular(this.tablename);
	this.relations = [];
}

Model.prototype.addRelation = function(relation) {
	if (!relation) return;
	this.relations.push(relation);
};

module.exports = { Model };
