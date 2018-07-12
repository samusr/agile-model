const _ = require("lodash");
const path = require("path");
const generateModelGraph = require("./generate-model-graph");
const { createFile, createFolder, readFolders, promisifyEjs, write, log, spinner } = require("../utils");

/**
 * This module is used to generate a model within your app. Then it generates the migration file
 * that creates in your database. It also adds a db service group to /services/db corresponding
 * to the model
 */

module.exports = async function(model) {
    try {
        if (typeof model == "string") {
            model = generateModelGraph([model], "")[0];
        }

        await createModelFile(model);
        await createDBServiceFiles(model);
    } catch (err) {
        log.error(err);
    }
};

function createModelFile(model) {
    return new Promise(async function(resolve, reject) {
        try {
            log.info(`Creating model "${model.name}"`);
            spinner.start();
            let modelPath = path.join(process.cwd(), "/models/", model.file);

            // Create model file
            await createFile(modelPath);

            let modelTemplatePath = path.join(__dirname, "../template/models/model.js.ejs");
            let content = await promisifyEjs(modelTemplatePath, { model: model });

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

function createDBServiceFiles(model) {
    return new Promise(async function(resolve, reject) {
        try {
            log.info("Creating db files");
            spinner.start();

            // Remove the ".js" extension
            let modelFileName = model.file.split(".")[0];

            let createPromises = [
                createFolder(path.join(process.cwd(), "/services/db/", modelFileName)),
                createFile(path.join(process.cwd(), "/services/db/", modelFileName, "index.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelFileName, "create.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelFileName, "edit.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelFileName, "destroy.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelFileName, "find-by-id.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelFileName, "find-all.js")),
                createFile(path.join(process.cwd(), "/services/db/", modelFileName, "find-where-conditions.js"))
            ];

            await Promise.all(createPromises);

            // Copy template to db files
            let args = {
                modelName: model.name,
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
                write(path.join(process.cwd(), "/services/db/", modelFileName, "index.js"), fileContents[0]),
                write(path.join(process.cwd(), "/services/db/", modelFileName, "create.js"), fileContents[1]),
                write(path.join(process.cwd(), "/services/db/", modelFileName, "edit.js"), fileContents[2]),
                write(path.join(process.cwd(), "/services/db/", modelFileName, "destroy.js"), fileContents[3]),
                write(path.join(process.cwd(), "/services/db/", modelFileName, "find-by-id.js"), fileContents[4]),
                write(path.join(process.cwd(), "/services/db/", modelFileName, "find-all.js"), fileContents[5]),
                write(path.join(process.cwd(), "/services/db/", modelFileName, "find-where-conditions.js"), fileContents[6])
            ];

            await Promise.all(writePromises);

            let dbIndexText = "// All db files are accessed through here\n\n";

            let modelFolderGroups = await readFolders(path.join(process.cwd(), "/services/db"));
            for (let group of modelFolderGroups) {
                dbIndexText += `const ${_.camelCase(group)} = require("./${group}");\n`;
            }

            dbIndexText += "\nmodule.exports = {\n";
            for (let group of modelFolderGroups) {
                dbIndexText += `    ${_.camelCase(group)}: ${_.camelCase(group)},\n`;
            }
            dbIndexText += "};";

            await write(path.join(process.cwd(), "/services/db/index.js"), dbIndexText);

            log.info("DB files created successfully");
            spinner.stop();
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}