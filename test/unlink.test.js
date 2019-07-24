process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const { unlink, init, generate, link } = require("../src/lib");
const { path } = require("../src/utils");

describe("Feature test for the 'unlink' command", () => {
	before(function() {
		path.destroy(path.resolve("src"));
		init();
		generate("user");
		generate("post");
		link("user", "post", { relationType: "HAS_MANY" });
	});

	after(function() {
		path.destroy(path.resolve("src"));
		path.destroy(path.resolve("agility.js"));
	});

	it("should throw an error for an unsupported relation", () => {
		assert.throws(function() {
			unlink("user", "post", { relationType: "HAS_ONe" });
		}, Error);
	});

	it("should unlink User model from Post model on HAS_MANY relation", () => {
		assert.doesNotThrow(function() {
			unlink("user", "post", { relationType: "HAS_MANY" });
		});
	});
});
