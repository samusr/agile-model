process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const { generate, init } = require("../src/lib");
const { path } = require("../src/utils");

describe("Feature test for the 'generate' command", () => {
	before(function() {
		path.destroy(path.resolve("src/"));
		init();
	});

	after(function() {
		path.destroy(path.resolve("src/"));
	});

	it("should create a User model", () => {
		assert.doesNotThrow(function() {
			generate("user");
		});
	});

	it("should verify that test project files for User model exist", () => {
		const projectFilesPaths = [
			path.resolve(`${MODELS_DIRECTORY}/user.js`),
			path.resolve(`${DATABASE_DIRECTORY}/index.js`),
			path.resolve(`${DATABASE_DIRECTORY}/user/index.js`),
			path.resolve(`${DATABASE_DIRECTORY}/user/create.js`),
			path.resolve(`${DATABASE_DIRECTORY}/user/edit.js`),
			path.resolve(`${DATABASE_DIRECTORY}/user/destroy.js`),
			path.resolve(`${DATABASE_DIRECTORY}/user/find-all.js`),
			path.resolve(`${DATABASE_DIRECTORY}/user/find-by-id.js`),
			path.resolve(`${DATABASE_DIRECTORY}/user/find-by-uuid.js`),
			path.resolve(`${DATABASE_DIRECTORY}/user/find-where-conditions.js`)
		];

		for (const objectPath of projectFilesPaths) {
			assert.equal(path.exists(objectPath), true);
		}
	});
});
