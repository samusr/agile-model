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
    .action(setup);

commander
    .command("generate <modelname>")
    .description("Generates a model and associated database and migration files.")
    .action(generate);

commander.parse(process.argv);

// console.log(
//     JSON.stringify(
//         require("../lib/generate-model-graph")(["user", "post", "comment", "admin"], "user HAS_MANY [post comment], post HAS_MANY comment")
//     )
// );
