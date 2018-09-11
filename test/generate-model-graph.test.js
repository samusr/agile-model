const { assert } = require("chai");
const modelGraphGenerator = require("../dist/lib/generate-model-graph");

describe("Unit tests for model graph generator", () => {
	let graph;
	const config = {
		models: ["user", "post", "comment", "bird"],
		relations: "user HAS_MANY [post comment], post HAS_MANY comment, user HAS_MANY bird"
	};

	it("build a model graph from the config object", () => {
		assert.doesNotThrow(() => {
			graph = modelGraphGenerator(config.models, config.relations);
		});
	});

	it("should find three (4) relations in graph built", () => {
		assert.equal(graph.length, 4);
	});

	it("should find the source models of the relations as User, Post, Comment and Bird", () => {
		assert.equal(graph[0].sourceModel.modelName, "User");
		assert.equal(graph[1].sourceModel.modelName, "Post");
		assert.equal(graph[2].sourceModel.modelName, "Comment");
		assert.equal(graph[3].sourceModel.modelName, "Bird");
	});
});
