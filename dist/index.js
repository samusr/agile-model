#!/usr/bin/env node
process.env.NODE_ENV = "production";

const commander = require("commander");
const { init, setup, generate, createPortal } = require("../src/lib/core");
const { Model } = require("../src/lib/class");
require("../src/utils/array-tostring-shim");

commander
	.command("init")
	.description("Creates the agility.js file at the root of the project.")
	.action(init);

commander
	.command("setup")
	.description(
		"Sets the project up with an objection config file, services, models and migrations folders.\n\t\t       " +
			"If there's an agility.js file in the root, it is used to setup the models and relations."
	)
	.action(setup);

commander
	.command("generate <entity>")
	.description("Generates a new model and associated database and migration files.")
	.action(entityName => {
		generate(new Model(entityName));
	});

commander
	.command("create-portal <portalName>")
	.description("Creates a new portal group in the client-side of your application.")
	.action(createPortal);

commander.parse(process.argv);
