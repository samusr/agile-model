const recast = require("recast");
const { singular } = require("pluralize");
const { name, path, file, misc } = require("../utils");

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
	this.filepath = path.resolve(`src/server/models/${this.filename}`);
	this.relations = [];
}

Model.prototype.existsInProject = function() {
	return path.exists(this.filepath);
};

Model.prototype.relationMappings = function() {
	try {
		const code = recast.parse(file.read(this.filepath));
		return misc.searchCodeTree(code, "MethodDefinition", function(node) {
			return node.key.name == "relationMappings";
		})[0];
	} catch (err) {
		return false;
	}
};

Model.prototype.isRelatedTo = function(otherModel, relationType) {
	try {
		const methodDefinition = this.relationMappings();
		const returnStatement = misc.searchCodeTree(methodDefinition, "ReturnStatement", () => true)[0];
		const objectExpression = misc.searchCodeTree(returnStatement, "ObjectExpression", () => true)[0];

		if (!(otherModel instanceof Model)) otherModel = new Model(otherModel);
		const objectionRelations = {
			HasOneRelation: "HAS_ONE",
			HasManyRelation: "HAS_MANY",
			BelongsToOneRelation: "BELONGS_TO_ONE"
		};

		for (const p of objectExpression.properties) {
			const relationObject = p.value.properties[0];
			const relationMatch =
				relationObject.value.type == "MemberExpression" && objectionRelations[relationObject.value.property.name] == relationType;

			const fileNameRegex = /(^[\w|-]+)?([\w|-]+)(\\.js)?/;
			const modelClassObject = p.value.properties[1];
			const modelClassMatch =
				modelClassObject.value.type == "CallExpression" &&
				modelClassObject.value.arguments[0].type == "Literal" &&
				fileNameRegex.exec(modelClassObject.value.arguments[0].value)[0] == fileNameRegex.exec(otherModel.filename)[0];

			if (relationMatch && modelClassMatch) return true;
		}

		return false;
	} catch (err) {
		return false;
	}
};

module.exports = { Model };
