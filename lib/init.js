/**
 * This configures the objection config as well as services and migrations folders
 */

const path = require("path");
const exec = require("child_process").exec;
const { read, write, createFile, createFolder, log, spinner, promisifyEjs } = require("../utils");

module.exports = async function(args) {
    try {
        let env = args.env;
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
        await configureObjection(env);
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
                    log.success(`${packageName} has been installed`);
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

            log.success("Knex configuration complete.");
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}

function configureObjection(env) {
    return new Promise(async function(resolve, reject) {
        try {
            log.info("Configuring objection. Please wait...");

            spinner.start();

            const configFolderPath = path.join(process.cwd(), "/config");
            const objectionConfigFilePath = path.join(process.cwd(), "/config/objection.js");
            await createFolder(configFolderPath);
            await createFile(objectionConfigFilePath);

            const objectionTemplatePath = path.join(__dirname, "../template/objection.js.ejs");
            let content = await promisifyEjs(objectionTemplatePath, {
                env: env
            });

            await write(objectionConfigFilePath, content);

            spinner.stop();

            log.success("Objection configuration complete.");
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}
