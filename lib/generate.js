const path = require("path");
const pluralize = require("pluralize");
const { createFile, createFolder, promisifyEjs, write, log, spinner } = require("../utils");

/**
 * This module is used to generate a model within your app. Then it generates the migration file
 * that creates in your database. It also adds a db service group to /services/db corresponding
 * to the model
 */

module.exports = async function(modelName, args) {
    try {
        let tableName = args.tablename;
        let useLowecase = args.lowercase;
        let modelFileName = `${modelName}.js`;

        if (!tableName) {
            tableName = pluralize(modelName).toLowerCase();
        }

        if (useLowecase) {
            modelFileName = modelFileName[0].toLowerCase() + modelFileName.substring(1);
        } else {
            modelFileName = modelFileName[0].toUpperCase() + modelFileName.substring(1);
        }

        await createModelFile(modelName, modelFileName, tableName);
        await createDBServiceFiles(modelName, modelFileName);
    } catch (err) {
        log.error(err);
    }
};

function createModelFile(modelName, modelFileName, tableName) {
    return new Promise(async function(resolve, reject) {
        try {
            log.info(`Creating model "${modelName}"`);
            spinner.start();
            let modelPath = path.join(process.cwd(), "/models/", modelFileName);

            // Create model file
            await createFile(modelPath);

            let modelTemplatePath = path.join(__dirname, "../template/models/model.js.ejs");
            let content = await promisifyEjs(modelTemplatePath, {
                modelName: modelName,
                tableName: tableName
            });

            await write(modelPath, content);
            log.info("Model Created!");
            spinner.stop();
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}

function createDBServiceFiles(modelName, modelFileName) {
    return new Promise(async function(resolve, reject) {
        try {
            log.info("Creating db files");
            spinner.start();

            let createPromises = [
                createFolder(path.join(process.cwd(), "/services/db/", modelName.toLowerCase())),
                createFile(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "index.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "create.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "edit.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "destroy.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "find-by-id.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "find-all.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "find-where-conditions.js"))
            ];

            await Promise.all(createPromises);

            // Copy template to db files
            let args = {
                modelName: modelName,
                modelFileName: modelFileName
            };

            let readTemplatePromises = [
                promisifyEjs(path.join(__dirname, "../template/services/db/entity/index.js.ejs"), args),
                promisifyEjs(path.join(__dirname, "../template/services/db/entity/create.js.ejs"), args),
                promisifyEjs(path.join(__dirname, "../template/services/db/entity/edit.js.ejs"), args),
                promisifyEjs(path.join(__dirname, "../template/services/db/entity/destroy.js.ejs"), args),
                promisifyEjs(path.join(__dirname, "../template/services/db/entity/find-by-id.js.ejs"), args),
                promisifyEjs(path.join(__dirname, "../template/services/db/entity/find-all.js.ejs"), args),
                promisifyEjs(path.join(__dirname, "../template/services/db/entity/find-where-conditions.js.ejs"), args)
            ];

            let fileContents = await Promise.all(readTemplatePromises);

            let writePromises = [
                write(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "index.js"), fileContents[0]),
                write(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "create.js"), fileContents[1]),
                write(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "edit.js"), fileContents[2]),
                write(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "destroy.js"), fileContents[3]),
                write(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "find-by-id.js"), fileContents[4]),
                write(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "find-all.js"), fileContents[5]),
                write(path.join(process.cwd(), "/services/db/", modelName.toLowerCase(), "find-where-conditions.js"), fileContents[6])
            ];

            await Promise.all(writePromises);

            log.info("DB files created successfully");
            spinner.stop();
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}
