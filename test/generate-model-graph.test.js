// const { assert } = require("chai");
// const modelGraphGenerator = require("../lib/generate-model-graph");

// describe("Unit tests for model graph generator", () => {
// 	let graph;
// 	const config = {
// 		models: ["user", "post", "comment", "bird"],
// 		relations: "user HAS_MANY [post comment], post HAS_MANY comment, user HAS_MANY bird"
// 	};

// 	it("build a model graph from the config object", () => {
// 		assert.doesNotThrow(() => {
// 			graph = modelGraphGenerator(config.models, config.relations);
// 		});
// 	});

// 	it("should find three (5) relations in graph built", () => {
// 		assert.equal(graph.length, 5);
// 	});

// 	it("should find the source models of the relations as User, Post, Comment and Bird", () => {
// 		const checks = { user: false, post: false, comment: false, bird: false };

// 		for (const relation of graph) {
// 			switch (relation.sourceModel.modelName) {
// 				case "User":
// 					checks.user = true;
// 					break;
// 				case "Post":
// 					checks.post = true;
// 					break;
// 				case "Comment":
// 					checks.comment = true;
// 					break;
// 				case "Bird":
// 					checks.bird = true;
// 					break;
// 			}
// 		}

// 		assert.equal(checks.user && checks.post && checks.comment && checks.bird, true);
// 	});
// });
