process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const { link, init, generate } = require("../src/lib");
const { path } = require("../src/utils");

describe("Feature test for the 'link' command", () => {
	before(function() {
		path.destroy(path.resolve("src"));
		init();
		generate("user");
		generate("post");
	});

	after(function() {
		path.destroy(path.resolve("src"));
		path.destroy(path.resolve("agility.js"));
	});

	it("should throw an error for an unsupported relation", () => {
		assert.throws(function() {
			link("user", "post", { relationType: "HAS_ONe" });
		}, Error);
	});

	it("should link User model to Post model with HAS_MANY relation", () => {
		assert.doesNotThrow(function() {
			link("user", "post", { relationType: "HAS_MANY" });
		});
	});
});
