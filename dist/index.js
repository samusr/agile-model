#!/usr/bin/env node
const commander = require("commander");
const { init, generate, link } = require("../src/lib");
const { misc } = require("../src/utils");
misc.arrayToStringShim();

commander
	.command("init")
	.description("Creates the agility.js config file at the root of the project.")
	.action(init);

commander
	.command("generate <entity>")
	.description("Generates a new model and associated database and migration files.")
	.action(generate);

commander
	.command("link <lModel> <rModel>")
	.option("-t, --relation-type <type>", "Relation type. Supported values are HAS_MANY, HAS_ONE and BELONGS_TO_ONE")
	.description(
		"Creates a relation between the lModel (owner model) and rModel (owned model). (E.g. User HAS_MANY Post. User here is the owner model (I.e. lModel) and Post is the ownedModel (I.e. rModel))"
	)
	.action(link);

// commander
// 	.command("setup")
// 	.description(
// 		"Sets the project up with an objection config file, services, models and migrations folders.\n\t\t       " +
// 			"If there's an agility.js file in the root, it is used to setup the models and relations."
// 	)
// 	.action(setup);

// commander
// 	.command("create-portal <portalName>")
// 	.description("Creates a new portal group in the client-side of your application.")
// 	.action(createPortal);

commander.parse(process.argv);
