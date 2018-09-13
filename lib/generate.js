const _ = require("lodash");
const path = require("path");
const moment = require("moment");
const pluralize = require("pluralize");
const generateModelGraph = require("./generate-model-graph");
const { createFile, createFolder, readFolders, promisifyEjs, write, log, spinner } = require("../utils");

/**
 * This module is used to generate a model within your app. Then it generates the migration file
 * that creates in your database. It also adds a db service group to /services/db corresponding
 * to the model
 */

module.exports = async function(model, args) {
    try {
        if (typeof model == "string") {
            model = generateModelGraph([model], "")[0];
        }

        await createModelFile(model);
        await createMigrationFiles(model);
        await createDBServiceFiles(model);

        if (args.routes) await createRouteFiles(model);
        if (args.views) await createViewFiles(model, args.ext);
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

function createMigrationFiles(model) {
    return new Promise(async function(resolve, reject) {
        try {
            log.info(`Creating Migration File For "${model.name}"`);
            spinner.start();

            let migrationFilePath = path.join(process.cwd(), "/migrations/", `${moment().format("YYYYMMDDHHmmss")}_create_${model.table}_table.js`);

            await createFile(migrationFilePath);

            let content = await promisifyEjs(path.join(__dirname, "../template/migrations/migration.js.ejs"), { model: model, pluralize: pluralize });
            await write(migrationFilePath, content);

            log.info("Migration File Created!");
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

function createRouteFiles(model) {
    return new Promise(async function(resolve, reject) {
        // If the model.route array contains only the model name (i.e. has a size of one),
        // then there're no path components, hence terminate here
        if (model.route.length <= 1) {
            return resolve();
        }

        try {
            log.info(`Creating route files for "${model.name}"`);
            spinner.start();

            let routesRootFolderPath = path.join(process.cwd(), "/routes/");

            await createFolder(routesRootFolderPath);
            await createFile(path.join(routesRootFolderPath, "index.js"));

            let finalFolderPath = "";

            for (let i = 0; i < model.route.length; i++) {
                let tempFolderPath = routesRootFolderPath;

                for (let j = 0; j <= i; j++) {
                    tempFolderPath = path.join(tempFolderPath, model.route[j]);
                }

                await createFolder(tempFolderPath);
                await createFile(path.join(tempFolderPath, "index.js"));

                if (i == model.route.length - 1) finalFolderPath = tempFolderPath;
            }

            await createFile(path.join(finalFolderPath, "show-all.js"));
            await createFile(path.join(finalFolderPath, "show-create.js"));
            await createFile(path.join(finalFolderPath, "show-edit.js"));
            await createFile(path.join(finalFolderPath, "show-one.js"));
            await createFile(path.join(finalFolderPath, "create.js"));
            await createFile(path.join(finalFolderPath, "edit.js"));
            await createFile(path.join(finalFolderPath, "delete.js"));

            log.info("Route Files Created!");
            spinner.stop();
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}

function createViewFiles(model, fileExtension) {
    return new Promise(async function(resolve, reject) {
        // If the model.view array contains only the model name (i.e. has a size of one),
        // then there're no path components, hence terminate here
        if (model.view.length <= 1) {
            return resolve();
        }

        try {
            log.info(`Creating view files for "${model.name}"`);
            spinner.start();

            let viewsRootFolderPath = path.join(process.cwd(), "/views/");

            await createFolder(viewsRootFolderPath);
            await createFolder(path.join(viewsRootFolderPath, model.view[0]));
            await createFolder(path.join(viewsRootFolderPath, model.view[0], "/components/"));
            await createFolder(path.join(viewsRootFolderPath, model.view[0], "/essentials/"));
            await createFolder(path.join(viewsRootFolderPath, model.view[0], "/pages/"));

            let finalFolderPath = "";

            for (let i = 1; i < model.route.length; i++) {
                let tempFolderPath = path.join(viewsRootFolderPath, model.view[0], "/pages/");

                for (let j = 1; j <= i; j++) {
                    tempFolderPath = path.join(tempFolderPath, model.view[j]);
                }

                await createFolder(tempFolderPath);

                if (i == model.route.length - 1) finalFolderPath = tempFolderPath;
            }

            fileExtension = fileExtension.trim().toLowerCase();

            if (fileExtension.startsWith(".")) {
                fileExtension = fileExtension.substring(1);
            }

            await createFile(path.join(viewsRootFolderPath, model.view[0], `/essentials/styles.${fileExtension}`));
            await createFile(path.join(viewsRootFolderPath, model.view[0], `/essentials/scripts.${fileExtension}`));

            await write(
                path.join(viewsRootFolderPath, model.view[0], `/essentials/styles.${fileExtension}`),
                "<!-- Place all common stylesheet <link> tags here -->"
            );
            await write(
                path.join(viewsRootFolderPath, model.view[0], `/essentials/scripts.${fileExtension}`),
                "<!-- Place all common javascript <script> tags here -->"
            );

            await createFile(path.join(finalFolderPath, `show-all.${fileExtension}`));
            await createFile(path.join(finalFolderPath, `show-create.${fileExtension}`));
            await createFile(path.join(finalFolderPath, `show-edit.${fileExtension}`));
            await createFile(path.join(finalFolderPath, `show-one.${fileExtension}`));

            log.info("View Files Created!");
            spinner.stop();
            return resolve();
        } catch (err) {
            spinner.stop();
            return reject(err);
        }
    });
}
