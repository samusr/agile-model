/**
 * This configures the objection config as well as services and migrations folders
 */

const path = require("path");
const exec = require("child_process").exec;
const inquirer = require("inquirer");
const { read, write, createFile, createFolder, log, spinner, promisifyEjs } = require("../utils");

const CONFIG_FOLDER_PATH = path.join(process.cwd(), "/config");
const OBJECTION_CONFIG_FILE_PATH = path.join(CONFIG_FOLDER_PATH, "/objection.js");

module.exports = async function(args) {
    try {
        let env = args.env;
        let databaseClient = args.database;

        await knexInstaller();
        await knexInitializer(databaseClient);

        await createFolder(CONFIG_FOLDER_PATH);

        // Create objection.js config file
        await createFile(OBJECTION_CONFIG_FILE_PATH);
    } catch (err) {
        log.error(err);
    }
};

async function getPackageJSON() {
    let packageJsonPath = path.join(process.cwd(), "/package.json");
    let packageJsonString = await read(packageJsonPath);
    return JSON.parse(packageJsonString);
}

function resolvePositiveAnswers(value) {
    for (let ans of ["y", "yes", "ok", "true"]) {
        if (ans == value.trim().toLowerCase()) return true;
    }

    return false;
}

function knexInstaller() {
    return new Promise(async function(resolve, reject) {
        let packageJson = await getPackageJSON();

        if (!packageJson.dependencies.knex) {
            log.warning("\nKnex not found");

            let answers = await inquirer.prompt([
                {
                    name: "installKnex",
                    message: "knex is not installed. Would you like to install it (y/n)? ",
                    prefix: ""
                }
            ]);

            if (resolvePositiveAnswers(answers.installKnex)) {
                log.info("Running 'npm install knex --save'. Please wait for installation to complete...");

                let installer = exec("npm install knex --save");

                spinner.start();

                installer.on("exit", function() {
                    spinner.stop();
                    log.success("Knex has been installed");
                    return resolve();
                });

                installer.on("error", function(err) {
                    console.error("An error occurred with the installation of knex. Please try again later");
                    return reject(err);
                });
            } else {
                log.info("Skipping installation of knex");
                return resolve();
            }
        } else {
            log.info("knex is already installed");
            return resolve();
        }
    });
}

function knexInitializer(databaseClient = "pg") {
    return new Promise(async function(resolve, reject) {
        log.info("\nInitializing knex. Please wait...");

        let initializerFunction = async function() {
            spinner.stop();

            log.info("\nInitializing knex. Please wait...");

            const knexfilePath = path.join(process.cwd(), "/knexfile.js");
            const knexfileTemplatePath = path.join(__dirname, "../template/knexfile.js.ejs");

            await createFile(knexfilePath);

            let content = await promisifyEjs(knexfileTemplatePath, { client: databaseClient });

            await write(knexfilePath, content);

            log.success("Knex initialization complete.");

            return resolve();
        };

        let packageJson = await getPackageJSON();

        if (!packageJson.dependencies[databaseClient]) {
            let answers = await inquirer.prompt([
                {
                    name: "installDB",
                    message: `${databaseClient} is not installed. Would you like to install it (y/n)? `,
                    prefix: ""
                }
            ]);

            if (resolvePositiveAnswers(answers.installDB)) {
                log.info(`Downloading database client... 'npm install --save ${databaseClient}'`);

                let installer = exec(`npm install ${databaseClient} --save`);

                spinner.start();

                installer.on("exit", function() {
                    log.success(`Database client '${databaseClient}' has been installed`);
                    initializerFunction();
                });

                installer.on("error", function(err) {
                    console.error(`An error occurred with the installation of ${databaseClient}. Please try again later`);
                    return reject(err);
                });
            } else {
                log.info("Skipping knex file installation");
                return resolve();
            }
        } else {
            log.info(`${databaseClient} is already installed`);
            initializerFunction();
        }
    });
}
