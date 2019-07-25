#!/usr/bin/env node
const commander = require("commander");
const { init, generate, link, unlink, setup } = require("../src/lib");
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
	.option("-c, --create-link-migration", "Create a migration to add foreign key to dependent model's table")
	.description(
		"Creates a relation between the lModel (owner model) and rModel (owned model). (E.g. User HAS_MANY Post. User here is the owner model (I.e. lModel) and Post is the ownedModel (I.e. rModel))"
	)
	.action(link);

commander
	.command("unlink <lModel> <rModel>")
	.option("-t, --relation-type <type>", "Relation type. Supported values are HAS_MANY, HAS_ONE and BELONGS_TO_ONE")
	.option("-c, --create-unlink-migration", "Create a migration to remove foreign key from dependent model's table")
	.description("Removes a relation between the lModel (owner model) and rModel (owned model)")
	.action(unlink);

commander
	.command("setup")
	.description("Creates the required project files")
	.action(setup);

commander.parse(process.argv);
