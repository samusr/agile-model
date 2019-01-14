const _ = require("lodash");
const path = require("path");
const moment = require("moment");
const { Model } = require("./models"); // eslint-disable-line no-unused-vars
const { createFile, createFolder, renderEJS, writeToFile, readFolder, getRootDir } = require("../utils");

/**
 * Generates the model, migration and db service files for a model object
 * @param {Model} model The model object
 */
module.exports = async model => {
    await createModelFile(model);
    await createMigrationFile(model);
    await createDBServiceFiles(model);
};

/**
 * Creates the model file
 * @param {Model} model The model object
 */
const createModelFile = async model => {
    const templatePath = path.join(__dirname, "../template/server/models/model.js.ejs");
    const content = await renderEJS(templatePath, { model });
    const modelPath = path.resolve(getRootDir(), "src/server/models", model.filename);

    createFile(modelPath);
    writeToFile(modelPath, content);
};

/**
 * Creates the migration file
 * @param {Model} model The model object
 */
const createMigrationFile = async model => {
    const templatePath = path.join(__dirname, "../template/server/migrations/migration.js.ejs");
    const templateContent = await renderEJS(templatePath, { model });
    const migrationName = `${moment().format("YYYYMMDDHHmmss_SSS")}_create_${model.tablename}.js`;
    const migrationPath = path.resolve(getRootDir(), "src/server/migrations", migrationName);

    createFile(migrationPath);
    writeToFile(migrationPath, templateContent);
};

/**
 * Creates the db service file
 * @param {Model} model The model object
 */
const createDBServiceFiles = async model => {
    const renderArgs = { model };
    const readPromises = [
        renderEJS(path.join(__dirname, "../template/server/services/db/entity/index.js.ejs"), renderArgs),
        renderEJS(path.join(__dirname, "../template/server/services/db/entity/create.js.ejs"), renderArgs),
        renderEJS(path.join(__dirname, "../template/server/services/db/entity/edit.js.ejs"), renderArgs),
        renderEJS(path.join(__dirname, "../template/server/services/db/entity/destroy.js.ejs"), renderArgs),
        renderEJS(path.join(__dirname, "../template/server/services/db/entity/find-by-id.js.ejs"), renderArgs),
        renderEJS(path.join(__dirname, "../template/server/services/db/entity/find-all.js.ejs"), renderArgs),
        renderEJS(path.join(__dirname, "../template/server/services/db/entity/find-where-conditions.js.ejs"), renderArgs)
    ];
    const templateContent = await Promise.all(readPromises);

    const modelFileName = model.filename.split(".")[0];
    const dbServicePath = path.resolve(getRootDir(), "src/server/services/db", modelFileName);
    const createPromises = [
        createFolder(path.join(dbServicePath)),
        createFile(path.join(dbServicePath, "index.js")),
        createFile(path.join(dbServicePath, "create.js")),
        createFile(path.join(dbServicePath, "edit.js")),
        createFile(path.join(dbServicePath, "destroy.js")),
        createFile(path.join(dbServicePath, "find-by-id.js")),
        createFile(path.join(dbServicePath, "find-all.js")),
        createFile(path.join(dbServicePath, "find-where-conditions.js"))
    ];
    await Promise.all(createPromises);

    const writePromises = [
        writeToFile(path.join(dbServicePath, "index.js"), templateContent[0]),
        writeToFile(path.join(dbServicePath, "create.js"), templateContent[1]),
        writeToFile(path.join(dbServicePath, "edit.js"), templateContent[2]),
        writeToFile(path.join(dbServicePath, "destroy.js"), templateContent[3]),
        writeToFile(path.join(dbServicePath, "find-by-id.js"), templateContent[4]),
        writeToFile(path.join(dbServicePath, "find-all.js"), templateContent[5]),
        writeToFile(path.join(dbServicePath, "find-where-conditions.js"), templateContent[6])
    ];
    await Promise.all(writePromises);

    // Modify the database index file to reflect new model group
    const dbFolderPath = path.resolve(getRootDir(), "src/server/services/db");
    const modelFolderGroups = await readFolder(dbFolderPath);

    let dbIndexText = modelFolderGroups.reduce((acc, group) => {
        return `${acc}const ${_.camelCase(group)} = require("./${group}");\n`;
    }, "");

    dbIndexText += "\nmodule.exports = {\n";

    dbIndexText += modelFolderGroups.reduce((acc, group) => {
        return `${acc}	${_.camelCase(group)},\n`;
    }, "");

    dbIndexText += "};";

    await writeToFile(path.join(dbFolderPath, "index.js"), dbIndexText);
};