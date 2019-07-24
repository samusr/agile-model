const nodePath = require("path");
const recast = require("recast");
const prettier = require("prettier");
const { Model, Relation } = require("../models");
const { log, file, misc } = require("../utils");

module.exports = function(lModelName, rModelName, { relationType }) {
	try {
		const relation = new Relation(relationType);
		const lModel = new Model(lModelName);
		const rModel = new Model(rModelName);

		// Check if models exist
		if (!lModel.existsInProject()) throw new Error(`Model does not exist - ${lModel.name}`);
		if (!rModel.existsInProject()) throw new Error(`Model does not exist - ${rModel.name}`);

		// If models are not already related, inject the appropriate relations into both files
		if (!lModel.isRelatedTo(rModel, relation.type)) {
			ensureRelationMappingsFunctionExists(lModel);
			injectRelationCode(lModel, rModel, relation.type);
		}

		if (!rModel.isRelatedTo(lModel, relation.reverseType)) {
			ensureRelationMappingsFunctionExists(rModel);
			injectRelationCode(rModel, lModel, relation.reverseType);
			// For the related model
		}
	} catch (err) {
		log.error(err);
		return process.exit(-1);
	}
};

function ensureRelationMappingsFunctionExists(model) {
	const modelCode = recast.parse(file.read(model.filepath));
	const classExpression = misc.searchCodeTree(modelCode, "ClassExpression", function(node) {
		return node.id.name == model.name;
	})[0];

	const classBody = misc.searchCodeTree(classExpression, "ClassBody", () => true)[0];
	const relationMappingsMethodDefinition = misc.searchCodeTree(classBody, "MethodDefinition", function(node) {
		return node.key.name == "relationMappings";
	})[0];

	if (relationMappingsMethodDefinition) {
		const returnStatement = misc.searchCodeTree(relationMappingsMethodDefinition, "ReturnStatement", () => true)[0];

		if (!returnStatement) {
			// If no return statement exists, remove the relationMappings all together to make way for a new one
			classBody.body.splice(classBody.body.indexOf(relationMappingsMethodDefinition), 1);
		} else return;
	}

	const templatePath = nodePath.join(__dirname, "../template/server/models/model-relation-mappings.js.ejs");
	const parsedContent = JSON.parse(file.render(templatePath));
	classBody.body.push(parsedContent);

	file.write(model.filepath, prettier.format(recast.print(modelCode).code, misc.prettierConfig));
}

function injectRelationCode(model, otherModel, relationType) {
	const modelCode = recast.parse(file.read(model.filepath));
	const classExpression = misc.searchCodeTree(modelCode, "ClassExpression", function(node) {
		return node.id.name == model.name;
	})[0];

	const classBody = misc.searchCodeTree(classExpression, "ClassBody", () => true)[0];
	const relationMappingsMethodDefinition = misc.searchCodeTree(classBody, "MethodDefinition", function(node) {
		return node.key.name == "relationMappings";
	})[0];

	const returnStatement = misc.searchCodeTree(relationMappingsMethodDefinition, "ReturnStatement", () => true)[0];

	switch (relationType) {
		case "HAS_ONE": {
			const templatePath = nodePath.join(__dirname, "../template/server/models/has-one-relation-property.js.ejs");
			const parsedContent = JSON.parse(file.render(templatePath, { lModel: model, rModel: otherModel }));
			returnStatement.argument.properties.push(parsedContent);
			break;
		}
		case "HAS_MANY": {
			const templatePath = nodePath.join(__dirname, "../template/server/models/has-many-relation-property.js.ejs");
			const parsedContent = JSON.parse(file.render(templatePath, { lModel: model, rModel: otherModel }));
			returnStatement.argument.properties.push(parsedContent);
			break;
		}
		case "BELONGS_TO_ONE": {
			const templatePath = nodePath.join(__dirname, "../template/server/models/belongs-to-one-relation-property.js.ejs");
			const parsedContent = JSON.parse(file.render(templatePath, { lModel: model, rModel: otherModel }));
			returnStatement.argument.properties.push(parsedContent);
			break;
		}
	}

	file.write(model.filepath, prettier.format(recast.print(modelCode).code, misc.prettierConfig));
}

// function createFindByRelatedModelIdDBFile = (relationType)
