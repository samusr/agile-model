const recast = require("recast");
const prettier = require("prettier");
const { Model, Relation, Association } = require("../models");
const { file, path, misc } = require("../utils");

module.exports = function(lModelName, rModelName, { relationType, createUnlinkMigration }) {
	misc.readAgilityConfig();
	const relation = new Relation(relationType);
	const lModel = new Model(lModelName);
	const rModel = new Model(rModelName);

	// Check if models exist
	if (!lModel.existsInProject()) throw new Error(`Model does not exist - ${lModel.name}`);
	if (!rModel.existsInProject()) throw new Error(`Model does not exist - ${rModel.name}`);

	// If models are related, proceed to unlink them
	if (lModel.isRelatedTo(rModel, relation.type)) {
		removeRelationCode(lModel, rModel, relation.type);

		if (relation.type == "BELONGS_TO_ONE") {
			removeFindByRelationIdDBFile(lModel, rModel);
			if (createUnlinkMigration) createUnlinkMigrationFile(lModel, rModel);
		}
	}

	if (rModel.isRelatedTo(lModel, relation.reverseType)) {
		removeRelationCode(rModel, lModel, relation.reverseType);

		if (relation.reverseType == "BELONGS_TO_ONE") {
			removeFindByRelationIdDBFile(rModel, lModel);
			if (createUnlinkMigration) createUnlinkMigrationFile(rModel, lModel);
		}
	}
};

function removeRelationCode(model, otherModel, relationType) {
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
		case "HAS_ONE":
		case "BELONGS_TO_ONE": {
			const rModelRelationProperty = misc.searchCodeTree(returnStatement, "Property", function(node) {
				return node.key.name == otherModel.singular_tablename;
			})[0];
			const propertyIndex = returnStatement.argument.properties.indexOf(rModelRelationProperty);
			returnStatement.argument.properties.splice(propertyIndex, 1);
			break;
		}
		case "HAS_MANY": {
			const rModelRelationProperty = misc.searchCodeTree(returnStatement, "Property", function(node) {
				return node.key.name == otherModel.tablename;
			})[0];
			const propertyIndex = returnStatement.argument.properties.indexOf(rModelRelationProperty);
			returnStatement.argument.properties.splice(propertyIndex, 1);
			break;
		}
	}

	file.write(model.filepath, prettier.format(recast.print(modelCode).code, misc.prettierConfig));
}

function removeFindByRelationIdDBFile(model, relatedModel) {
	const association = new Association(relatedModel, model);
	const modelFileNameWithoutExtension = model.filename.split(".")[0];
	const dbServicePath = path.resolve(`${DATABASE_DIRECTORY}/${modelFileNameWithoutExtension}/`);

	if (path.exists(`${dbServicePath}/${association.dbRelationFileName}`)) {
		path.destroy(`${dbServicePath}/${association.dbRelationFileName}`);
		misc.updateIndex(dbServicePath, "file");
	}
}

function createUnlinkMigrationFile(model, relatedModel) {
	const migrationName = `${misc.formattedTime()}_drop_${relatedModel.singular_tablename}_id_from_${model.tablename}_table.js`;
	const templatePath = path.resolve("../template/server/migrations/unlink-migration.js.ejs", __dirname);
	const content = prettier.format(file.render(templatePath, { lModel: model, rModel: relatedModel }), misc.prettierConfig);
	const migrationPath = path.resolve(`${MIGRATIONS_DIRECTORY}/${migrationName}`);

	file.create(migrationPath);
	file.write(migrationPath, content);
}
