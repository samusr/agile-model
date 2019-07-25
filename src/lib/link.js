const recast = require("recast");
const prettier = require("prettier");
const { Model, Relation, Association } = require("../models");
const { file, path, misc } = require("../utils");

module.exports = function(lModelName, rModelName, { relationType, createLinkMigration }) {
	misc.readAgilityConfig();
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

		if (relation.type == "BELONGS_TO_ONE") {
			createFindByRelationIdDBFile(lModel, rModel);
			if (createLinkMigration) createLinkMigrationFile(lModel, rModel);
		}
	}

	if (!rModel.isRelatedTo(lModel, relation.reverseType)) {
		ensureRelationMappingsFunctionExists(rModel);
		injectRelationCode(rModel, lModel, relation.reverseType);

		if (relation.reverseType == "BELONGS_TO_ONE") {
			createFindByRelationIdDBFile(rModel, lModel);
			if (createLinkMigration) createLinkMigrationFile(rModel, lModel);
		}
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

	const templatePath = path.resolve("../template/server/models/model-relation-mappings.js.ejs", __dirname);
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
			const templatePath = path.resolve("../template/server/models/has-one-relation-property.js.ejs", __dirname);
			const parsedContent = JSON.parse(file.render(templatePath, { lModel: model, rModel: otherModel }));
			returnStatement.argument.properties.push(parsedContent);
			break;
		}
		case "HAS_MANY": {
			const templatePath = path.resolve("../template/server/models/has-many-relation-property.js.ejs", __dirname);
			const parsedContent = JSON.parse(file.render(templatePath, { lModel: model, rModel: otherModel }));
			returnStatement.argument.properties.push(parsedContent);
			break;
		}
		case "BELONGS_TO_ONE": {
			const templatePath = path.resolve("../template/server/models/belongs-to-one-relation-property.js.ejs", __dirname);
			const parsedContent = JSON.parse(file.render(templatePath, { lModel: model, rModel: otherModel }));
			returnStatement.argument.properties.push(parsedContent);
			break;
		}
	}

	file.write(model.filepath, prettier.format(recast.print(modelCode).code, misc.prettierConfig));
}

function createFindByRelationIdDBFile(model, relatedModel) {
	const association = new Association(relatedModel, model);
	const modelFileNameWithoutExtension = model.filename.split(".")[0];
	const dbServicePath = path.resolve(`src/server/services/db/${modelFileNameWithoutExtension}/`);

	if (!path.exists(`${dbServicePath}/${association.dbRelationFileName}`)) {
		file.create(`${dbServicePath}/${association.dbRelationFileName}`);
		const content = file.render(path.resolve("../template/server/services/db/entity/find-by-relation-id.js.ejs", __dirname), { association });
		file.write(`${dbServicePath}/${association.dbRelationFileName}`, content);
		misc.updateIndex(dbServicePath, "file");
	}
}

function createLinkMigrationFile(model, relatedModel) {
	const migrationName = `${misc.formattedTime()}_add_${relatedModel.singular_tablename}_id_to_${model.tablename}_table.js`;
	const templatePath = path.resolve("../template/server/migrations/link-migration.js.ejs", __dirname);
	const content = prettier.format(file.render(templatePath, { lModel: model, rModel: relatedModel }), misc.prettierConfig);
	const migrationPath = path.resolve(`src/server/migrations/${migrationName}`);

	file.create(migrationPath);
	file.write(migrationPath, content);
}
