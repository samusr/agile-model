process.env.NODE_ENV = "testing";

// const fse = require("fs-extra");
const { assert } = require("chai");
const { generate } = require("../src/lib");
const { path } = require("../src/utils");

describe("Feature test for the 'generate' command", () => {
	const SRC_ROOT = path.rootDir() + "src/";

	before(function() {
		path.destroy(SRC_ROOT);
	});

	// after(function() {
	// });

	it("should create a User model", () => {
		assert.doesNotThrow(function() {
			generate("user");
		});
	});

	it("should verify that test project files for User model exist", () => {
		const projectFilesPaths = [
			SRC_ROOT + "server/models/user.js",
			SRC_ROOT + "server/services/db/user/index.js",
			SRC_ROOT + "server/services/db/user/create.js",
			SRC_ROOT + "server/services/db/user/edit.js",
			SRC_ROOT + "server/services/db/user/destroy.js",
			SRC_ROOT + "server/services/db/user/find-all.js",
			SRC_ROOT + "server/services/db/user/find-by-id.js",
			SRC_ROOT + "server/services/db/user/find-by-uuid.js",
			SRC_ROOT + "server/services/db/user/find-where-conditions.js"
		];

		for (const objectPath of projectFilesPaths) {
			assert.equal(path.exists(objectPath), true);
		}
	});
});
