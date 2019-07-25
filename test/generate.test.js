process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const { generate, init } = require("../src/lib");
const { path } = require("../src/utils");

describe("Feature test for the 'generate' command", () => {
	before(function() {
		path.destroy(path.resolve("src"));
		init();
	});

	after(function() {
		path.destroy(path.resolve("src"));
		path.destroy(path.resolve("agility.js"));
	});

	it("should create a User model", () => {
		assert.doesNotThrow(function() {
			generate("user");
		});
	});

	it("should verify that test project files for User model exist", () => {
		const projectFilesPaths = [
			path.resolve(`src/server/models/user.js`),
			path.resolve(`src/server/services/db/index.js`),
			path.resolve(`src/server/services/db/user/index.js`),
			path.resolve(`src/server/services/db/user/create.js`),
			path.resolve(`src/server/services/db/user/edit.js`),
			path.resolve(`src/server/services/db/user/destroy.js`),
			path.resolve(`src/server/services/db/user/find-all.js`),
			path.resolve(`src/server/services/db/user/find-by-id.js`),
			path.resolve(`src/server/services/db/user/find-by-uuid.js`),
			path.resolve(`src/server/services/db/user/find-where-conditions.js`)
		];

		for (const objectPath of projectFilesPaths) {
			assert.equal(path.exists(objectPath), true);
		}
	});
});
