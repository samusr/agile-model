const _ = require("lodash");
const path = require("path");
const moment = require("moment");
// eslint-disable-next-line no-unused-vars
const { Model, ModelAssociationPair } = require("./class");
const { createFile, createFolder, renderEJS, writeToFile, readFolder, getRootDir } = require("../utils");

/**
 * Generates the model, migration and db service files for a model object
 * @param {Model} model The model object
 */
module.exports = model => {
	createModelFile(model);
	createMigrationFile(model);
	createDBServiceFiles(model);
};

/**
 * Creates the model file
 * @param {Model} model The model object
 */
const createModelFile = model => {
	const templatePath = path.join(__dirname, "../../template/server/models/model.js.ejs");
	const modelPath = path.join(getRootDir(), "src/server/models", model.filename);
	createFile(modelPath);
	writeToFile(modelPath, renderEJS(templatePath, { model }));
};

/**
 * Creates the migration file
 * @param {Model} model The model object
 */
const createMigrationFile = model => {
	const templatePath = path.join(__dirname, "../../template/server/migrations/migration.js.ejs");
	const migrationName = `${moment().format("YYYYMMDDHHmmss_SSS")}_create_${model.tablename}.js`;
	const migrationPath = path.join(getRootDir(), "src/server/migrations", migrationName);
	createFile(migrationPath);
	writeToFile(migrationPath, renderEJS(templatePath, { model }));
};

/**
 * Creates the db service file
 * @param {Model} model The model object
 */
const createDBServiceFiles = model => {
	const modelFileName = model.filename.split(".")[0];
	const dbServicePath = path.join(getRootDir(), "src/server/services/db", modelFileName);
	createFolder(path.join(dbServicePath));
	createFile(path.join(dbServicePath, "index.js"));
	createFile(path.join(dbServicePath, "create.js"));
	createFile(path.join(dbServicePath, "edit.js"));
	createFile(path.join(dbServicePath, "destroy.js"));
	createFile(path.join(dbServicePath, "find-by-id.js"));
	createFile(path.join(dbServicePath, "find-all.js"));
	createFile(path.join(dbServicePath, "find-where-conditions.js"));

	const renderArgs = { model };
	const templateContent = [
		renderEJS(path.join(__dirname, "../../template/server/services/db/entity/index.js.ejs"), renderArgs),
		renderEJS(path.join(__dirname, "../../template/server/services/db/entity/create.js.ejs"), renderArgs),
		renderEJS(path.join(__dirname, "../../template/server/services/db/entity/edit.js.ejs"), renderArgs),
		renderEJS(path.join(__dirname, "../../template/server/services/db/entity/destroy.js.ejs"), renderArgs),
		renderEJS(path.join(__dirname, "../../template/server/services/db/entity/find-by-id.js.ejs"), renderArgs),
		renderEJS(path.join(__dirname, "../../template/server/services/db/entity/find-all.js.ejs"), renderArgs),
		renderEJS(path.join(__dirname, "../../template/server/services/db/entity/find-where-conditions.js.ejs"), renderArgs)
	];
	writeToFile(path.join(dbServicePath, "index.js"), templateContent[0]);
	writeToFile(path.join(dbServicePath, "create.js"), templateContent[1]);
	writeToFile(path.join(dbServicePath, "edit.js"), templateContent[2]);
	writeToFile(path.join(dbServicePath, "destroy.js"), templateContent[3]);
	writeToFile(path.join(dbServicePath, "find-by-id.js"), templateContent[4]);
	writeToFile(path.join(dbServicePath, "find-all.js"), templateContent[5]);
	writeToFile(path.join(dbServicePath, "find-where-conditions.js"), templateContent[6]);

	// Before we modify the index file, we need to create the 'find-by-relation.js' files
	for (const relation of model.relations) {
		if (relation.type == "BELONGS_TO_ONE") {
			const modelPair = new ModelAssociationPair(relation.model, model);
			createFile(path.join(dbServicePath, modelPair.dbRelationFileName));
			const content = renderEJS(path.join(__dirname, "../../template/server/services/db/entity/find-by-relation-id.js.ejs"), {
				pair: modelPair
			});
			writeToFile(path.join(dbServicePath, modelPair.dbRelationFileName), content);
		}
	}

	// Modify the database index file to reflect new model group
	const dbFolderPath = path.join(getRootDir(), "src/server/services/db");
	const modelFolderGroups = readFolder(dbFolderPath, "folder");

	let dbIndexText = modelFolderGroups.reduce((acc, group) => {
		return `${acc}const ${_.camelCase(group)} = require("./${group}");\n`;
	}, "");

	dbIndexText += "\nmodule.exports = {\n";

	dbIndexText += modelFolderGroups.reduce((acc, group) => {
		return `${acc}	${_.camelCase(group)},\n`;
	}, "");

	dbIndexText += "};";

	writeToFile(path.join(dbFolderPath, "index.js"), dbIndexText);
};
