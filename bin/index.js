#!/usr/bin/env node

const commander = require("commander");
const init = require("../lib/init");
const generate = require("../lib/generate");

commander
    .command("init")
    .description(
        "Initializes the project with the objection config file, sets up the 'services/db/index.js' file and adds /models and /migrations folders"
    )
    .option("-e, --env [value]", "The desired node environment string.", "development")
    .option("-d, --database [value]", "The database client to install.", "pg")
    .action(init);

commander
    .command("generate <modelname>")
    .description("Generates a model file, associated database CRUD files then modifies the database index file to include the new group")
    .option(
        "-t, --tablename [value]",
        "The table name to use for this model (This is used in the migration file name as well). If this is not specified, a plural form of the model name will be used"
    )
    .option("-l, --no-lowercase", "Do not use a lower case hyphenated naming for the model (eg. new-registration.js)")
    .action(generate);

commander.parse(process.argv);
