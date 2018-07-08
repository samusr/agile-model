#!/usr/bin/env node

const commander = require("commander");
const init = require("../lib/init");

commander
    .command("init")
    .description("Initializes the project with the objection config file, sets up the 'services/db/index.js' file and creates a migration folder")
    .option("-e, --env [value]", "The desired node environment string. Defaults to development", "development")
    .option("-d, --database [value]", "The database client to install. Defaults to pg", "pg")
    .action(init);

commander.parse(process.argv);
