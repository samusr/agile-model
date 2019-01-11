const path = require("path");
const { fromModelGraph } = require("./generate");
const generateModelGraph = require("./generate-model-graph");
const { pathExists, renderEJS, getRootDir, log, createFile, createFolder, writeToFile } = require("./utils");

/**
 * Configures the project foder
 */
module.exports = async function() {
    try {
        await configurePackageJSON();
        await configureKnex();
        await configureObjection();
        await createServerStructure();
        await createClientStructure();
        await createAdditionalFiles();
        await processAgilityConfig();

        log(`\nTHINGS TO DO`, "info");
        log(`************\n`, "info");
        log(`1. Run "npm install" to download dependencies`, "info");
        log(`2. Setup your Postgres and Mongo databases`, "info");
        log(`3. Add other columns to tables in your migration files and verify that your models and migrations are correct`, "info");
        log(`4. Include these variables in your environment: MONGODB_URI, DATABASE_URI and SESSION_SECRET`, "info");
        log(`5. Run "knex migrate:latest" to run your migrations`, "info");
        log(`6. Configure webpack.js file`, "info");
        log(`7. Run "git init" if you want version management control`, "info");
        log(`8. Start the server with "npm start"`, "info");
    } catch (err) {
        log(err, "error");
    }
};

const configurePackageJSON = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const knexfilePath = `${getRootDir()}package.json`;
            await createFile(knexfilePath);

            const templatePath = path.join(__dirname, "../template/package.json.ejs");
            const content = await renderEJS(templatePath);

            await writeToFile(knexfilePath, content);

            log("package.json configured", "success");
            return resolve();
        } catch (err) {
            return reject(err);
        }
    });
};

const configureKnex = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const knexfilePath = `${getRootDir()}knexfile.js`;
            await createFile(knexfilePath);

            const templatePath = path.join(__dirname, "../template/knexfile.js.ejs");
            const content = await renderEJS(templatePath);

            await writeToFile(knexfilePath, content);

            log("Knex configuration complete", "success");
            return resolve();
        } catch (err) {
            return reject(err);
        }
    });
};

const configureObjection = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const configFolderPath = `${getRootDir()}src/server/config`;
            const objectionConfigFilePath = `${getRootDir()}src/server/config/objection.js`;
            await createFolder(configFolderPath);
            await createFile(objectionConfigFilePath);

            const objectionTemplatePath = path.join(__dirname, "../template/server/config/objection.js.ejs");
            const content = await renderEJS(objectionTemplatePath);

            await writeToFile(objectionConfigFilePath, content);

            log("Objection configuration complete", "success");
            return resolve();
        } catch (err) {
            return reject(err);
        }
    });
};

const createServerStructure = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const rootDir = path.join(getRootDir(), "src/server/");
            const routesIndexFilePath = `${rootDir}routes/index.js`;
            const servicesIndexFilePath = `${rootDir}services/index.js`;
            const dbIndexFilePath = `${rootDir}services/db/index.js`;
            const appFilePath = `${rootDir}app.js`;

            const createPromises = [
                createFolder(`${rootDir}models`),
                createFolder(`${rootDir}migrations`),
                createFolder(`${rootDir}routes`),
                createFolder(`${rootDir}services`),
                createFolder(`${rootDir}services/db`),
                createFile(routesIndexFilePath),
                createFile(servicesIndexFilePath),
                createFile(dbIndexFilePath),
                createFile(appFilePath)
            ];

            await Promise.all(createPromises);

            const readPromises = [
                renderEJS(path.join(__dirname, "../template/server/routes/index.js.ejs")),
                renderEJS(path.join(__dirname, "../template/server/services/index.js.ejs")),
                renderEJS(path.join(__dirname, "../template/server/services/db/index.js.ejs")),
                renderEJS(path.join(__dirname, "../template/server/app.js.ejs"))
            ];

            const content = await Promise.all(readPromises);

            const writePromises = [
                writeToFile(routesIndexFilePath, content[0]),
                writeToFile(servicesIndexFilePath, content[1]),
                writeToFile(dbIndexFilePath, content[2]),
                writeToFile(appFilePath, content[3])
            ];

            await Promise.all(writePromises);

            log("Finished structuring server folder", "success");
            return resolve();
        } catch (err) {
            return reject(err);
        }
    });
};

const createClientStructure = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const srcClientAppFilePath = `${getRootDir()}src/client/app.js`;
            const distIndexFilePath = `${getRootDir()}dist/index.ejs`;

            const createPromises = [
                await createFolder(`${getRootDir()}src/client/`),
                await createFolder(`${getRootDir()}dist/`),
                await createFile(srcClientAppFilePath),
                await createFile(distIndexFilePath)
            ];

            await Promise.all(createPromises);

            const readPromises = [
                renderEJS(path.join(__dirname, "../template/client/app.js.ejs")),
                renderEJS(path.join(__dirname, "../template/client/index.ejs"))
            ];

            const content = await Promise.all(readPromises);

            const writePromises = [writeToFile(srcClientAppFilePath, content[0]), writeToFile(distIndexFilePath, content[1])];

            await Promise.all(writePromises);

            log("Finished structuring client folder", "success");
            return resolve();
        } catch (err) {
            return reject(err);
        }
    });
};

const createAdditionalFiles = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const babelrcPath = `${getRootDir()}.babelrc`;
            const eslintrcPath = `${getRootDir()}.eslintrc`;
            const webpackPath = `${getRootDir()}webpack.js`;
            const nodemonJSONPath = `${getRootDir()}nodemon.json`;
            const babelrcTemplatePath = path.join(__dirname, "../template/.babelrc.ejs");
            const eslintrcTemplatePath = path.join(__dirname, "../template/.eslintrc.ejs");
            const webpackTemplatePath = path.join(__dirname, "../template/webpack.js.ejs");
            const nodemonJSONTemplatePath = path.join(__dirname, "../template/nodemon.json.ejs");

            const createPromises = [createFile(babelrcPath), createFile(eslintrcPath), createFile(webpackPath), createFile(nodemonJSONPath)];
            await Promise.all(createPromises);

            const readPromises = [
                renderEJS(babelrcTemplatePath),
                renderEJS(eslintrcTemplatePath),
                renderEJS(webpackTemplatePath),
                renderEJS(nodemonJSONTemplatePath)
            ];

            const content = await Promise.all(readPromises);

            const writePromises = [
                writeToFile(babelrcPath, content[0]),
                writeToFile(eslintrcPath, content[1]),
                writeToFile(webpackPath, content[2]),
                writeToFile(nodemonJSONPath, content[3])
            ];

            await Promise.all(writePromises);

            if (process.env.NODE_ENV != "development") {
                const gitignorePath = `${getRootDir()}.gitignore`;
                const gitignoreTemplatePath = path.join(__dirname, "../template/.gitignore.ejs");

                await createFile(gitignorePath);
                const gitContent = await renderEJS(gitignoreTemplatePath);
                await writeToFile(gitignorePath, gitContent);
            }

            log("Finished creating additional files", "success");
            return resolve();
        } catch (err) {
            return reject(err);
        }
    });
};

const processAgilityConfig = () => {
    return new Promise(async function(resolve, reject) {
        try {
            const agilityConfigPath = path.join(getRootDir(), "agility.js");

            if (!pathExists(agilityConfigPath)) {
                log(`No agility.js file found in root\nIf you want to use this file, please run "agile-model init"`, "warning");
                return resolve();
            }

            const agilityConfig = require(agilityConfigPath);
            const models = agilityConfig.models;
            const relationString = agilityConfig.relations;

            // Generate model graph
            const modelGraph = generateModelGraph(models, relationString);

            // Group relations accoring to sourceModels
            const processedGraphModels = [];

            for (const graphRelation of modelGraph) {
                if (processedGraphModels.includes(graphRelation.sourceModel)) continue;

                // Find all the graph relations with the same source models to an ImplementationRelation
                const relatedGraphRelations = [graphRelation];

                for (const _graphRelation of modelGraph) {
                    if (graphRelation == _graphRelation) continue;

                    if (_graphRelation.sourceModel == graphRelation.sourceModel) {
                        relatedGraphRelations.push(_graphRelation);
                    }
                }

                log(`Setting up "${relatedGraphRelations[0].sourceModel.modelName}"`, "info");

                await fromModelGraph(relatedGraphRelations);

                log(`Generated "${relatedGraphRelations[0].sourceModel.modelName}"\n`, "info");

                // Sleep for a bit. This is necessary to prevent the migration files timestamp from being exact
                await new Promise(resolve => setTimeout(resolve, 100));

                processedGraphModels.push(graphRelation.sourceModel);
            }

            log("Finished processing agility.js", "success");
            return resolve();
        } catch (err) {
            return reject(err);
        }
    });
};