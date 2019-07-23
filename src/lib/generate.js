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
	const modelPath = path.resolve(`src/server/models/${model.filename}`);
	file.create(modelPath);
	file.write(modelPath, content);
}

function createMigrationFile(n) {
	const model = new Model(n);
	const migrationName = `${formattedTime()}_create_${model.tablename}_table.js`;
	const templatePath = nodePath.join(__dirname, "../template/server/migrations/migration.js.ejs");
	const content = prettier.format(file.render(templatePath, { model }), misc.prettierConfig);
	const migrationPath = path.resolve(`src/server/migrations/${migrationName}`);
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
	const dbServicePath = path.resolve(`src/server/services/db/${modelFileNameWithoutExtension}/`);
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
}
