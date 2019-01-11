const _ = require("lodash");
const path = require("path");
const moment = require("moment");
const generateModelGraph = require("./generate-model-graph");
const GraphModel = require("./models/graph-model"); // eslint-disable-line no-unused-vars
const { GraphRelation } = require("./models/graph-relation"); // eslint-disable-line no-unused-vars
const ImplementationRelation = require("./models/implementation-relation");
const { createFile, createFolder, readFolder, renderEJS, writeToFile, log, getRootDir } = require("./utils");

/**
 * Generates a single model from the given filename and its corresponding
 * files (i.e. databse, model and migration files)
 */
module.exports.fromModelName = async function(/** @type {string} */ modelName) {
	try {
		const modelGraph = generateModelGraph([modelName], "");
		await generate(modelGraph);
	} catch (err) {
		log(err, "error");
	}
};

/**
 * Generates models from a given model graph and their corresponding
 * files (i.e. databse, model and migration files)
 */
module.exports.fromModelGraph = async function(/**@type {Array<GraphRelation>} */ modelGraph) {
	try {
		await generate(modelGraph);
	} catch (err) {
		log(err, "error");
	}
};

const generate = async (/**@type {Array<GraphRelation>} */ modelGraph) => {
	try {
		const relation = new ImplementationRelation(modelGraph);

		await createModelFile(relation);
		await createMigrationFiles(relation);
		await createDBServiceFiles(relation);
	} catch (err) {
		log(err, "error");
	}
};

const createModelFile = (/**@type {ImplementationRelation} */ relation) => {
	return new Promise(async function(resolve, reject) {
		try {
			const rootDir = path.join(getRootDir(), "src/server/models/");
			const modelFilePath = rootDir + relation.sourceModel.modelFilename;

			await createFile(modelFilePath);

			const modelTemplatePath = path.join(__dirname, "../template/server/models/model.js.ejs");
			const content = await renderEJS(modelTemplatePath, { relation });

			await writeToFile(modelFilePath, content);
			log("Model Created!", "success");
			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
};

const createMigrationFiles = (/**@type {ImplementationRelation} */ relation) => {
	return new Promise(async function(resolve, reject) {
		try {
			const rootDir = path.join(getRootDir(), "src/server/migrations/");
			const migrationFilePath = `${rootDir}${moment().format("YYYYMMDDHHmmssSSS")}_create_${relation.sourceModel.tablename}_table.js`;

			await createFile(migrationFilePath);

			const migrationTemplatePath = path.join(__dirname, "../template/server/migrations/migration.js.ejs");
			const content = await renderEJS(migrationTemplatePath, { relation });

			await writeToFile(migrationFilePath, content);
			log("Migration File Created!", "success");
			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
};

const createDBServiceFiles = (/**@type {ImplementationRelation} */ relation) => {
	return new Promise(async function(resolve, reject) {
		try {
			const rootDir = path.join(getRootDir(), "src/server/services/db/");
			const modelFileName = relation.sourceModel.modelFilename.split(".")[0];

			// Create the necessary folder and files
			const createPromises = [
				createFolder(path.join(rootDir, modelFileName)),
				createFile(path.join(rootDir, modelFileName, "index.js")),
				createFile(path.join(rootDir, modelFileName, "create.js")),
				createFile(path.join(rootDir, modelFileName, "edit.js")),
				createFile(path.join(rootDir, modelFileName, "destroy.js")),
				createFile(path.join(rootDir, modelFileName, "find-by-id.js")),
				createFile(path.join(rootDir, modelFileName, "find-all.js")),
				createFile(path.join(rootDir, modelFileName, "find-where-conditions.js"))
			];

			await Promise.all(createPromises);

			// Copy template to db files
			const renderArgs = { modelName: relation.sourceModel.modelName, modelFileName: relation.sourceModel.modelFilename };

			const readTemplatePromises = [
				renderEJS(path.join(__dirname, "../template/server/services/db/entity/index.js.ejs"), renderArgs),
				renderEJS(path.join(__dirname, "../template/server/services/db/entity/create.js.ejs"), renderArgs),
				renderEJS(path.join(__dirname, "../template/server/services/db/entity/edit.js.ejs"), renderArgs),
				renderEJS(path.join(__dirname, "../template/server/services/db/entity/destroy.js.ejs"), renderArgs),
				renderEJS(path.join(__dirname, "../template/server/services/db/entity/find-by-id.js.ejs"), renderArgs),
				renderEJS(path.join(__dirname, "../template/server/services/db/entity/find-all.js.ejs"), renderArgs),
				renderEJS(path.join(__dirname, "../template/server/services/db/entity/find-where-conditions.js.ejs"), renderArgs)
			];

			const content = await Promise.all(readTemplatePromises);

			const writePromises = [
				writeToFile(path.join(rootDir, modelFileName, "index.js"), content[0]),
				writeToFile(path.join(rootDir, modelFileName, "create.js"), content[1]),
				writeToFile(path.join(rootDir, modelFileName, "edit.js"), content[2]),
				writeToFile(path.join(rootDir, modelFileName, "destroy.js"), content[3]),
				writeToFile(path.join(rootDir, modelFileName, "find-by-id.js"), content[4]),
				writeToFile(path.join(rootDir, modelFileName, "find-all.js"), content[5]),
				writeToFile(path.join(rootDir, modelFileName, "find-where-conditions.js"), content[6])
			];

			await Promise.all(writePromises);

			// Modify the db index file
			const modelFolderGroups = await readFolder(rootDir);

			let dbIndexText = modelFolderGroups.reduce((acc, group) => {
				return `${acc}const ${_.camelCase(group)} = require("./${group}");\n`;
			}, "");

			dbIndexText += "\nmodule.exports = {\n";

			dbIndexText += modelFolderGroups.reduce((acc, group) => {
				return `${acc}	${_.camelCase(group)},\n`;
			}, "");

			dbIndexText += "};";

			await writeToFile(path.join(rootDir, "index.js"), dbIndexText);

			log("DB files created successfully", "success");
			return resolve();
		} catch (err) {
			return reject(err);
		}
	});
};
