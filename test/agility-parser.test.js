process.env.NODE_ENV = "testing";

const { assert } = require("chai");
const { agilityParser, init } = require("../src/lib");
const { path, misc } = require("../src/utils");

describe("Unit test for the agility parser", () => {
	const modelsConfig = {
		names: ["A", "B", "C", "D"],
		relations: "A HAS_MANY [B C], A HAS_ONE D, B HAS_ONE C, C HAS_ONE B"
	};

	const modelGraph = [];

	before(function() {
		init();
		misc.readAgilityConfig();
	});

	after(function() {
		path.destroy(path.resolve("agility.js"));
	});

	it("should throw an error for non existent model in models array", () => {
		assert.throws(function() {
			agilityParser.parse(modelsConfig.names, modelsConfig.relations + ", E HAS_MANY B");
		}, Error);
	});

	it("should parse models config", () => {
		assert.doesNotThrow(function() {
			modelGraph.push(...agilityParser.parse(modelsConfig.names, modelsConfig.relations));
		});
	});

	it("should verify correctness of generated model graph", () => {
		assert.equal(modelGraph.length, modelsConfig.names.length + 1); // Because of circular dependency
		assert.equal(modelGraph[0].name, "A");
		assert.equal(modelGraph.filter(m => m.name == "A")[0].relations.length, 3);
		assert.equal(modelGraph.filter(m => m.name == "B")[0].relations.length, 2);
		assert.equal(modelGraph.filter(m => m.name == "BC")[0].relations.length, 2);
		assert.equal(modelGraph.filter(m => m.name == "C")[0].relations.length, 2);
		assert.equal(modelGraph.filter(m => m.name == "D")[0].relations.length, 1);
	});
});
