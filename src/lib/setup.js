const link = require("./link");
const generate = require("./generate");
const agilityParser = require("./agility-parser");
const { path, file, log, folder, misc } = require("../utils");

module.exports = function() {
	const agilityConfig = misc.readAgilityConfig();

	folder.create(path.resolve("dist"));
	folder.create(path.resolve("logs"));
	folder.create(path.resolve("src"));
	folder.create(path.resolve("src/server"));
	folder.create(path.resolve("src/server/config"));
	folder.create(path.resolve("src/server/models"));
	folder.create(path.resolve("src/server/migrations"));
	folder.create(path.resolve("src/server/routes"));
	folder.create(path.resolve("src/server/services"));
	folder.create(path.resolve("src/server/services/db"));
	folder.create(path.resolve("src/client"));

	const projectFileParams = [
		["src/server/config/objection.js", "../template/server/config/objection.js.ejs"],
		["src/server/config/winston.js", "../template/server/config/winston.js.ejs"],
		["src/server/routes/index.js", "../template/server/routes/index.js.ejs"],
		["src/server/services/index.js", "../template/server/services/index.js.ejs"],
		["src/server/services/db/index.js", "../template/server/services/db/index.js.ejs"],
		["src/server/app.js", "../template/server/app.js.ejs"],
		[".babelrc.js", "../template/.babelrc.js.ejs"],
		[".eslintrc", "../template/.eslintrc.ejs"],
		[".gitignore", "../template/.gitignore.ejs"],
		["knexfile.js", "../template/knexfile.js.ejs"],
		["nodemon-template.json", "../template/nodemon-template.json.ejs"],
		["nodemon.json", "../template/nodemon.json.ejs"],
		["package.json", "../template/package.json.ejs"],
		["webpack.common.js", "../template/webpack.common.js.ejs"],
		["webpack.dev.js", "../template/webpack.dev.js.ejs"],
		["webpack.lib.dev.js", "../template/webpack.lib.dev.js.ejs"],
		["webpack.lib.js", "../template/webpack.lib.js.ejs"],
		["webpack.lib.prod.js", "../template/webpack.lib.prod.js.ejs"],
		["webpack.prod.js", "../template/webpack.prod.js.ejs"]
	];

	if (process.platform == "win32") {
		projectFileParams.push(["migrate.bat", "../template/migrate.bat.ejs"], ["rollback.bat", "../template/rollback.bat.ejs"]);
	} else projectFileParams.push(["migrate.sh", "../template/migrate.sh.ejs"], ["rollback.sh", "../template/rollback.sh.ejs"]);

	for (const params of projectFileParams) {
		const filePath = path.resolve(params[0]);
		const templatePath = path.resolve(params[1], __dirname);
		const content = file.render(path.resolve(templatePath, __dirname));

		file.create(filePath);
		file.write(filePath, content);
	}

	const modelGraph = agilityParser.parse(agilityConfig.models, agilityConfig.relations);
	for (const model of modelGraph) generate(model.name);
	for (const model of modelGraph) {
		for (const relation of model.relations) {
			link(model.name, relation.model.name, { relationType: relation.type, createLinkMigration: true });
		}
	}
	misc.updateIndex(path.resolve("src/server/services/db"), "folder");

	log.success(`\nTHINGS TO DO`);
	log.success(`************\n`);
	log.success(`1. Run "npm install" to download dependencies`);
	log.success(`2. Setup your Postgres and Mongo databases`);
	log.success(`3. In your migration files (/src/server/migrations/), add additional columns to your tables`);
	log.success(`4. Include these variables in your environment (I.e. nodemon.json): MONGODB_URI, DATABASE_URI and SESSION_SECRET`);
	log.success(`5. Verify that your models and migrations and db files were correctly formed`);
	log.success(`6. Run "knex migrate:latest" to run your migrations`);
	log.success(`7. Configure webpack if you'll be using a client interface`);
	log.success(`8. Run "git init" if you want version management control`);
	log.success(`9. Start the server with "npm run server"`);
};
