process.env.NODE_ENV = "testing";

const decache = require("decache");
const { assert } = require("chai");
const { init, setup } = require("../src/lib");
const { path, file, folder } = require("../src/utils");

describe("Feature test for the 'setup' command", () => {
	function reset() {
		// Delete all files and folders in the test app directory
		const objectPaths = folder.read(path.rootDir());
		for (const objectPath of objectPaths) path.destroy(path.resolve(objectPath));
		// Recreate the .gitignore file
		file.create(path.resolve(".gitignore"));
		file.write(path.resolve(".gitignore"), "*\n!.gitignore");
	}

	before(() => {
		reset();
		init();
		file.write(
			path.resolve("agility.js"),
			'module.exports = { models: ["User", "Post", "Comment"], relations: "User HAS_MANY [Post Comment], Post HAS_MANY Comment" };'
		);
		decache(path.resolve("agility.js"));
	});

	after(reset);

	it("should generate a project", () => {
		assert.doesNotThrow(setup);
	});

	it("should verify that all project folders were created", () => {
		const projectFolderPaths = [
			"dist",
			"logs",
			"src",
			"src/server",
			"src/server/config",
			"src/server/models",
			"src/server/migrations",
			"src/server/routes",
			"src/server/services",
			"src/server/services/db",
			"src/client"
		];

		for (const objectPath of projectFolderPaths) {
			assert.equal(path.exists(path.resolve(objectPath)), true);
		}
	});

	it("should verify that all project files were created", () => {
		const projectFilePaths = [
			"src/server/config/objection.js",
			"src/server/config/winston.js",
			"src/server/routes/index.js",
			"src/server/services/index.js",
			"src/server/services/db/index.js",
			"src/server/app.js",
			".babelrc.js",
			".eslintrc",
			".gitignore",
			"knexfile.js",
			"nodemon-template.json",
			"nodemon.json",
			"package.json",
			"webpack.common.js",
			"webpack.dev.js",
			"webpack.lib.dev.js",
			"webpack.lib.js",
			"webpack.lib.prod.js",
			"webpack.prod.js"
		];

		if (process.platform == "win32") {
			projectFilePaths.push("migrate.bat", "rollback.bat");
		} else projectFilePaths.push("migrate.sh", "rollback.sh");

		for (const objectPath of projectFilePaths) {
			assert.equal(path.exists(path.resolve(objectPath)), true);
		}
	});

	it("should verify that all model files were created", () => {
		const modelFilePaths = [
			"src/server/models/user.js",
			"src/server/models/post.js",
			"src/server/models/comment.js",
			"src/server/services/db/user/create.js",
			"src/server/services/db/user/destroy.js",
			"src/server/services/db/user/edit.js",
			"src/server/services/db/user/find-all.js",
			"src/server/services/db/user/find-by-id.js",
			"src/server/services/db/user/find-by-uuid.js",
			"src/server/services/db/user/find-where-conditions.js",
			"src/server/services/db/user/index.js",
			"src/server/services/db/post/create.js",
			"src/server/services/db/post/destroy.js",
			"src/server/services/db/post/edit.js",
			"src/server/services/db/post/find-all.js",
			"src/server/services/db/post/find-by-id.js",
			"src/server/services/db/post/find-by-uuid.js",
			"src/server/services/db/post/find-by-user-id.js",
			"src/server/services/db/post/find-where-conditions.js",
			"src/server/services/db/post/index.js",
			"src/server/services/db/comment/create.js",
			"src/server/services/db/comment/destroy.js",
			"src/server/services/db/comment/edit.js",
			"src/server/services/db/comment/find-all.js",
			"src/server/services/db/comment/find-by-id.js",
			"src/server/services/db/comment/find-by-uuid.js",
			"src/server/services/db/comment/find-by-user-id.js",
			"src/server/services/db/comment/find-by-post-id.js",
			"src/server/services/db/comment/find-where-conditions.js",
			"src/server/services/db/comment/index.js"
		];

		for (const objectPath of modelFilePaths) {
			assert.equal(path.exists(path.resolve(objectPath)), true);
		}

		const migrationFiles = folder.read(path.resolve("src/server/migrations"), "file");
		assert.equal(migrationFiles.length, 6);
	});
});
