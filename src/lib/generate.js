// const _ = require("lodash");
const nodePath = require("path");
const prettier = require("prettier");
const { path, file, folder, misc } = require("../utils");
const { Model } = require("../models");

module.exports = function(name) {
	createModelFile(name);
	createMigrationFile(name);
	createDBServiceFiles(name);
};

function createModelFile(n) {
	const model = new Model(n);
	const templatePath = nodePath.join(__dirname, "../template/server/models/model.js.ejs");
	const content = prettier.format(file.render(templatePath, { model }), misc.prettierConfig);
	const modelPath = path.rootDir() + "src/server/models/" + model.filename;
	file.create(modelPath);
	file.write(modelPath, content);
}

function createMigrationFile(n) {
	const model = new Model(n);
	const migrationName = `${formattedTime()}_create_${model.tablename}_table.js`;
	const templatePath = nodePath.join(__dirname, "../template/server/migrations/migration.js.ejs");
	const content = prettier.format(file.render(templatePath, { model }), misc.prettierConfig);
	const migrationPath = path.rootDir() + "src/server/migrations/" + migrationName;
	file.create(migrationPath);
	file.write(migrationPath, content);
}

function formattedTime() {
	const d = new Date();
	const dateComponent = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
	const timeComponent = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}_${pad(d.getMilliseconds())}`;
	return dateComponent + timeComponent;
}

function pad(str) {
	return str.toString().padStart(2, "0");
}

function createDBServiceFiles(n) {
	const model = new Model(n);
	const modelFileNameWithoutExtension = model.filename.split(".")[0];
	const dbServicePath = path.rootDir() + "src/server/services/db/" + modelFileNameWithoutExtension + "/";
	folder.create(nodePath.join(dbServicePath));

	const dbServiceFileParams = [
		["index.js", "index.js.ejs"],
		["create.js", "create.js.ejs"],
		["destroy.js", "destroy.js.ejs"],
		["edit.js", "edit.js.ejs"],
		["find-all.js", "find-all.js.ejs"],
		["find-by-id.js", "find-by-id.js.ejs"],
		["find-by-uuid.js", "find-by-uuid.js.ejs"],
		["find-where-conditions.js", "find-where-conditions.js.ejs"]
	];

	const args = { model };

	for (const params of dbServiceFileParams) {
		file.create(dbServicePath + params[0]);
		const targetFile = "../template/server/services/db/entity/" + params[1];
		const content = prettier.format(file.render(nodePath.join(__dirname, targetFile), args), misc.prettierConfig);
		file.write(dbServicePath + params[0], content);
	}

	misc.updateDBIndexFile();

	// file.create(dbServicePath + "index.js");
	// file.create(dbServicePath + "create.js");
	// file.create(dbServicePath + "edit.js");
	// file.create(dbServicePath + "destroy.js");
	// file.create(dbServicePath + "find-by-id.js");
	// file.create(dbServicePath + "find-all.js");
	// file.create(dbServicePath + "find-where-conditions.js");

	// const templateContent = [
	// 	renderEJS(nodePath.join(__dirname, "../../template/server/services/db/entity/index.js.ejs"), args),
	// 	renderEJS(nodePath.join(__dirname, "../../template/server/services/db/entity/create.js.ejs"), args),
	// 	renderEJS(nodePath.join(__dirname, "../../template/server/services/db/entity/edit.js.ejs"), args),
	// 	renderEJS(nodePath.join(__dirname, "../../template/server/services/db/entity/destroy.js.ejs"), args),
	// 	renderEJS(nodePath.join(__dirname, "../../template/server/services/db/entity/find-by-id.js.ejs"), args),
	// 	renderEJS(nodePath.join(__dirname, "../../template/server/services/db/entity/find-all.js.ejs"), args),
	// 	renderEJS(nodePath.join(__dirname, "../../template/server/services/db/entity/find-where-conditions.js.ejs"), args)
	// ];

	// writeToFile(nodePath.join(dbServicePath, "index.js"), templateContent[0]);
	// writeToFile(nodePath.join(dbServicePath, "create.js"), templateContent[1]);
	// writeToFile(nodePath.join(dbServicePath, "edit.js"), templateContent[2]);
	// writeToFile(nodePath.join(dbServicePath, "destroy.js"), templateContent[3]);
	// writeToFile(nodePath.join(dbServicePath, "find-by-id.js"), templateContent[4]);
	// writeToFile(nodePath.join(dbServicePath, "find-all.js"), templateContent[5]);
	// writeToFile(nodePath.join(dbServicePath, "find-where-conditions.js"), templateContent[6]);

	// Before we modify the index file, we need to create the 'find-by-relation.js' files
	// for (const relation of model.relations) {
	// 	if (relation.type == "BELONGS_TO_ONE") {
	// 		const modelPair = new ModelAssociationPair(relation.model, model);
	// 		createFile(nodePath.join(dbServicePath, modelPair.dbRelationFileName));
	// 		const content = renderEJS(nodePath.join(__dirname, "../../template/server/services/db/entity/find-by-relation-id.js.ejs"), {
	// 			pair: modelPair
	// 		});
	// 		writeToFile(nodePath.join(dbServicePath, modelPair.dbRelationFileName), content);
	// 	}
	// }

	// Modify the database index file to reflect new model group
	// const dbFolderPath = nodePath.join(getRootDir(), "src/server/services/db");
	// const modelFolderGroups = readFolder(dbFolderPath, "folder");

	// let dbIndexText = modelFolderGroups.reduce((acc, group) => {
	// 	return `${acc}const ${_.camelCase(group)} = require("./${group}");\n`;
	// }, "");

	// dbIndexText += "\nmodule.exports = {\n";

	// dbIndexText += modelFolderGroups.reduce((acc, group) => {
	// 	return `${acc}	${_.camelCase(group)},\n`;
	// }, "");

	// dbIndexText += "};";

	// writeToFile(nodePath.join(dbFolderPath, "index.js"), dbIndexText);
}
