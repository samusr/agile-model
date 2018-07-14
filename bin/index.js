#!/usr/bin/env node

const commander = require("commander");
const init = require("../lib/init");
const setup = require("../lib/setup");
const generate = require("../lib/generate");

// commander.command("init").description("Creates the agility.js file at the root of the project").action(init);

commander
    .command("init")
    .description("Creates the agility.js file at the root of the project.")
    .action(init);

commander
    .command("setup")
    .description(
        "Sets the project up with an objection config file, services, models and migrations folders.\n\t\t\t\t    " +
            "If there's an agility.js file in the root, it is used to setup the models and relations."
    )
    .option("-d, --database [value]", "The database client to install.", "pg")
    .option("-e, --ext [value]", "The extension to use for the view files", "ejs")
    .option("--no-routes", "Skips the creation of route folders and files")
    .option("--no-views", "Skips the creation of view folders and files")
    .action(setup);

commander
    .command("generate <modelname>")
    .description("Generates a model and associated database and migration files.")
    .option("-e, --ext [value]", "The extension to use for the view files", "ejs")
    .option("--no-routes", "Skips the creation of route folders and files")
    .option("--no-views", "Skips the creation of view folders and files")
    .action(generate);

commander.parse(process.argv);
