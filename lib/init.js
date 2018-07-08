/**
 * This configures the objection config as well as services and migrations folders
 */

const exec = require("child_process").exec;
const path = require("path");
const inquirer = require("inquirer");
const { log, read, spinner } = require("../utils");

const PACKAGE_JSON_PATH = path.join(process.cwd(), "/package.json");
const CONFIG_FOLDER_PATH = path.join(process.cwd(), "/config");
const OBJECTION_CONFIG_FILE_PATH = path.join(CONFIG_FOLDER_PATH, "/objection");

module.exports = async function(args) {
    try {
        await runKnexInstaller();

        // Create confi
        // await createFolder(CONFIG_FOLDER_PATH);

        // let env = args.env;
        // let databaseClient = args.database;
    } catch (err) {
        log.error(err);
    }
};

function resolvePositiveAnswers(value) {
    for (let ans of ["y", "yes", "ok"]) {
        if (ans == value.trim().toLowerCase()) return true;
    }

    return false;
}

function runKnexInstaller() {
    return new Promise(async function(resolve, reject) {
        const packageJsonString = await read(PACKAGE_JSON_PATH);
        const packageJson = JSON.parse(packageJsonString);

        if (!packageJson.dependencies.knex) {
            // Install knex
            log.warning("\nKnex not found");

            let answers = await inquirer.prompt([
                {
                    name: "installKnex",
                    message: "Knex is not installed. Would you like to install it (y/n)? ",
                    prefix: ""
                }
            ]);

            if (resolvePositiveAnswers(answers.installKnex)) {
                log.info("Running 'npm install knex --save'. Please wait for installation to complete...");
                spinner.start();

                let installer = exec("npm install knex --save");

                installer.on("exit", function() {
                    spinner.stop();
                    log.success("Knex has been installed");
                    return resolve();
                });

                installer.on("error", function(err) {
                    console.error("An error occurred with the installation of knex. Please try again later");
                    return reject(err);
                });
            }
        }

        log.info("Knex is already installed");
        resolve();
    });
}
