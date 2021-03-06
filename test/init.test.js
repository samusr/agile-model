process.env.NODE_ENV = "testing";

const fse = require("fs-extra");
const { assert } = require("chai");
const { init } = require("../src/lib");
const { path, file } = require("../src/utils");

describe("Feature test for the 'init' command", () => {
	const agilityPath = path.resolve("agility.js");

	after(function() {
		fse.removeSync(agilityPath);
	});

	it("should create an agility at the test project root", () => {
		assert.doesNotThrow(init);
	});

	it("should verify that agility.js was created at test project root", () => {
		assert.equal(path.exists(agilityPath), true);
	});

	it("should verify that agility.js content is same as the template file", () => {
		const fileContent = file.read(agilityPath);
		assert.equal(file.render(path.resolve("../src/template/agility.js.ejs", __dirname)), fileContent);
	});
});
