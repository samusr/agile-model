const prettier = require("prettier");
const { path, file, folder, misc } = require("../utils");
const { Model } = require("../models");

module.exports = function(name) {
	misc.readAgilityConfig();
	createModelFile(name);
	createMigrationFile(name);
	createDBServiceFiles(name);
};

function createModelFile(n) {
	const model = new Model(n);
	const templatePath = path.resolve("../template/server/models/model.js.ejs", __dirname);
	const content = prettier.format(file.render(templatePath, { model }), misc.prettierConfig);

	file.create(model.filepath);
	file.write(model.filepath, content);
}

function createMigrationFile(n) {
	const model = new Model(n);
	const migrationName = `${formattedTime()}_create_${model.tablename}_table.js`;
	const templatePath = path.resolve("../template/server/migrations/migration.js.ejs", __dirname);
	const content = prettier.format(file.render(templatePath, { model }), misc.prettierConfig);
	const migrationPath = path.resolve(`${MIGRATIONS_DIRECTORY}/${migrationName}`);

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
	const dbServicePath = path.resolve(`${DATABASE_DIRECTORY}/${modelFileNameWithoutExtension}/`);
	folder.create(dbServicePath);

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
		const filePath = `${dbServicePath}/${params[0]}`;
		file.create(filePath);
		const targetFile = "../template/server/services/db/entity/" + params[1];
		const content = prettier.format(file.render(path.resolve(targetFile, __dirname), args), misc.prettierConfig);
		file.write(filePath, content);
	}

	misc.updateIndexFile(path.resolve(DATABASE_DIRECTORY));

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