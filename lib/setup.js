/**
 * This configures the objection config as well as services and migrations folders
 */

const path = require("path");
const exec = require("child_process").exec;
const generate = require("./generate");
const { read, pathExists, write, createFile, createFolder, log, spinner, promisifyEjs } = require("../utils");

module.exports = async function(args) {
    try {
        let databaseClient = args.database;

        // Install knex
        await installPackage("knex");
        // Install objection
        await installPackage("objection");
        // Install database client
        await installPackage(databaseClient);

        // Configure knex
        await configureKnex(databaseClient);
        // Configure objection
        await configureObjection();

        // Create additional files folders
        await createAdditionalFilesAndFolders();

        // Process agility.config.js (If any)
        await processAgilityConfig();

        spinner.stop();
    } catch (err) {
        log.error(err);
    }
};

async function getPackageJSON() {
    let packageJsonPath = path.join(process.cwd(), "/package.json");
    let packageJsonString = await read(packageJsonPath);
    return JSON.parse(packageJsonString);
}

function installPackage(packageName) {
    return new Promise(async function(resolve, reject) {
        try {
            let packageJson = await getPackageJSON();

            if (!packageJson.dependencies.objection) {
                log.warning(`${packageName} not found`);
                log.info(`Installing ${packageName}`);
                log.info(`Running 'npm install ${packageName} --save'. Please wait for installation to complete...`);

                let installer = exec(`npm install ${packageName} --save`);

                spinner.start();

                installer.on("exit", function() {
                    spinner.stop();
                    log.info(`${packageName} has been installed`);
                    return resolve();
                });

                installer.on("error", function(err) {
                    spinner.stop();
                    console.error(`An error occurred with the installation of ${packageName}. Please try again`);
                    console.error(`If this error persists, try running 'npm install ${packageName}--save' manually`);
                    return reject(err);
                });
            } else {
                spinner.stop();
                log.info(`${packageName} is already installed. Skipping installation`);
                return resolve();
            }
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}

function configureKnex(databaseClient) {
    return new Promise(async function(resolve, reject) {
        try {
            log.info("Configuring knex. Please wait...");

            spinner.start();

            const knexfilePath = path.join(process.cwd(), "/knexfile.js");
            await createFile(knexfilePath);

            const knexfileTemplatePath = path.join(__dirname, "../template/knexfile.js.ejs");
            let content = await promisifyEjs(knexfileTemplatePath, { client: databaseClient });

            await write(knexfilePath, content);

            spinner.stop();

            log.info("Knex configuration complete.");
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}

function configureObjection() {
    return new Promise(async function(resolve, reject) {
        try {
            log.info("Configuring objection. Please wait...");

            spinner.start();

            const configFolderPath = path.join(process.cwd(), "/config");
            const objectionConfigFilePath = path.join(process.cwd(), "/config/objection.js");
            await createFolder(configFolderPath);
            await createFile(objectionConfigFilePath);

            const objectionTemplatePath = path.join(__dirname, "../template/config/objection.js.ejs");
            let content = await promisifyEjs(objectionTemplatePath, {});

            await write(objectionConfigFilePath, content);

            spinner.stop();

            log.info("Objection configuration complete.");
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}

function createAdditionalFilesAndFolders() {
    return new Promise(async function(resolve, reject) {
        try {
            log.info("Creating additional files and folders");
            spinner.start();
            let dbIndexFilePath = path.join(process.cwd(), "/services/db/index.js");

            let promises = [
                createFolder(path.join(process.cwd(), "/models")),
                createFolder(path.join(process.cwd(), "/migrations")),
                createFolder(path.join(process.cwd(), "/services")),
                createFolder(path.join(process.cwd(), "/services/db")),
                createFile(path.join(dbIndexFilePath))
            ];

            await Promise.all(promises);

            let dbIndexTemplateFilePath = path.join(__dirname, "../template/services/db/index.js.ejs");
            let content = await promisifyEjs(dbIndexTemplateFilePath);

            await write(dbIndexFilePath, content);

            spinner.stop();
            log.info("Finished creating additional files and folders");
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}

function processAgilityConfig() {
    return new Promise(async function(resolve, reject) {
        try {
            log.info("Processing agility.config.js");
            spinner.start();

            let agilityConfigPath = path.join(process.cwd(), "/agility.config.js");

            if (!pathExists(agilityConfigPath)) {
                spinner.stop();
                log.info(`No agility file found in root. If you want to use this file, please run "agile-model init"`);
                return resolve();
            }

            let agilityConfig = require(agilityConfigPath);
            let models = agilityConfig.models;

            // Create models
            for (let model of models) {
                await generate(model, { tablename: null });
            }

            log.info("Models generated");

            // Build relationship graph of models
            let relations = agilityConfig.relations;

            spinner.stop();
            log.info("Finished processing agility.config.js");
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}
