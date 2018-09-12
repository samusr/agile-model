#!/usr/bin/env node

require("../dist/lib/utils/array-tostring-shim");
const commander = require("commander");
const generateModelGraph = require("../dist/lib/generate-model-graph");

let agi = {
	models: ["user", "post", "comment", "bird"],
	relations: "user HAS_MANY [post comment], post HAS_MANY comment, post HAS_ONE user, comment HAS_MANY user"
};
// postgres://uf1nvpsokoe36t:pcac081037f46bc8503fa07abbc5f4ded70b00c2e32faa4d92997ada282b544b0@ec2-35-172-91-37.compute-1.amazonaws.com:5432/d1uge2sdknej0h
generateModelGraph(agi.models, agi.relations);
// const init = require("../lib/init");
// const setup = require("../lib/setup");
// const generate = require("../lib/generate");

// commander
// 	.command("init")
// 	.description("Creates the agility.js file at the root of the project.")
// 	.action(init);

// commander
// 	.command("setup")
// 	.description(
// 		"Sets the project up with an objection config file, services, models and migrations folders.\n\t\t\t\t    " +
// 			"If there's an agility.js file in the root, it is used to setup the models and relations."
// 	)
// 	.action(setup);

// commander
// 	.command("generate <entity>")
// 	.description("Generates a model and associated database and migration files.")
// 	.action(generate);

// commander.parse(process.argv);
