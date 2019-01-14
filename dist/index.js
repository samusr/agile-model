#!/usr/bin/env node
process.env.NODE_ENV = "production";

require("../src/utils/array-tostring-shim");
const commander = require("commander");

const init = require("../src/lib/init");
const setup = require("../src/lib/setup");
const generate = require("../src/lib/generate");
const { Model } = require("../src/lib/models");

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
    .description("Generates a model and associated database and migration files.")
    .action(entityName => {
        generate(new Model(entityName));
    });

commander.parse(process.argv);
