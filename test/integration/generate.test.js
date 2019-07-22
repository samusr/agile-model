// const path = require("path");
// const fse = require("fs-extra");
// const { assert } = require("chai");
// const { Model } = require("../../src/lib/class");
// const generate = require("../../src/lib/core/generate");
// const { pathExists, getRootDir } = require("../../src/utils");

// describe("Feature test for the generate command", () => {
// 	let testSrcDir;

// 	before(() => {
// 		process.env.NODE_ENV = "development";
// 		testSrcDir = path.join(getRootDir(), "src/");
// 	});

// 	after(() => {
// 		fse.removeSync(testSrcDir);
// 	});

// 	it("should create a User model", () => {
// 		assert.doesNotThrow(generate.bind(null, new Model("user")));
// 	});

// 	it("should verify that test project files for User model exist", () => {
// 		const projectFilesPaths = [
// 			"server/models/user.js",
// 			"server/services/db/user/index.js",
// 			"server/services/db/user/create.js",
// 			"server/services/db/user/edit.js",
// 			"server/services/db/user/destroy.js",
// 			"server/services/db/user/find-by-id.js",
// 			"server/services/db/user/find-all.js",
// 			"server/services/db/user/find-where-conditions.js"
// 		];

// 		const pathLib = path;

// 		for (const path of projectFilesPaths) {
// 			assert.equal(pathExists(pathLib.join(testSrcDir, path)), true);
// 		}
// 	});
// });
