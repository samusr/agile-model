const path = require("path");
const generate = require("./generate");
const agilityParser = require("./agility-parser");
const { pathExists, renderEJS, getRootDir, log, createFile, createFolder, writeToFile } = require("../utils");

/**
 * Configures the project foder
 */
module.exports = async () => {
    const rootDir = getRootDir();
    createFolder(path.join(rootDir, "dist"));
    createFolder(path.join(rootDir, "logs"));
    createFolder(path.join(rootDir, "src"));
    createFolder(path.join(rootDir, "src/server"));
    createFolder(path.join(rootDir, "src/server/config"));
    createFolder(path.join(rootDir, "src/server/models"));
    createFolder(path.join(rootDir, "src/server/migrations"));
    createFolder(path.join(rootDir, "src/server/routes"));
    createFolder(path.join(rootDir, "src/server/services"));
    createFolder(path.join(rootDir, "src/server/services/db"));
    createFolder(path.join(rootDir, "src/client"));

    createFile(path.join(rootDir, "dist/index.ejs"));
    createFile(path.join(rootDir, "src/client/app.js"));
    createFile(path.join(rootDir, "src/server/config/objection.js"));
    createFile(path.join(rootDir, "src/server/routes/index.js"));
    createFile(path.join(rootDir, "src/server/services/index.js"));
    createFile(path.join(rootDir, "src/server/services/db/index.js"));
    createFile(path.join(rootDir, "src/server/app.js"));
    createFile(path.join(rootDir, ".babelrc"));
    createFile(path.join(rootDir, ".eslintrc"));
    createFile(path.join(rootDir, ".gitignore"));
    createFile(path.join(rootDir, "knexfile.js"));
    createFile(path.join(rootDir, "migrate.bat"));
    createFile(path.join(rootDir, "nodemon.json"));
    createFile(path.join(rootDir, "package.json"));
    createFile(path.join(rootDir, "rollback.bat"));
    createFile(path.join(rootDir, "webpack.common.js"));
    createFile(path.join(rootDir, "webpack.dev.js"));
    createFile(path.join(rootDir, "webpack.prod.js"));

    const templatePath = path.join(__dirname, "../template");
    const renderPromises = [
        renderEJS(path.join(templatePath, "client/index.ejs")),
        renderEJS(path.join(templatePath, "client/app.js.ejs")),
        renderEJS(path.join(templatePath, "server/config/objection.js.ejs")),
        renderEJS(path.join(templatePath, "server/routes/index.js.ejs")),
        renderEJS(path.join(templatePath, "server/services/index.js.ejs")),
        renderEJS(path.join(templatePath, "server/services/db/index.js.ejs")),
        renderEJS(path.join(templatePath, "server/app.js.ejs")),
        renderEJS(path.join(templatePath, ".babelrc.ejs")),
        renderEJS(path.join(templatePath, ".eslintrc.ejs")),
        renderEJS(path.join(templatePath, ".gitignore.ejs")),
        renderEJS(path.join(templatePath, "knexfile.js.ejs")),
        renderEJS(path.join(templatePath, "migrate.bat.ejs")),
        renderEJS(path.join(templatePath, "nodemon.json.ejs")),
        renderEJS(path.join(templatePath, "package.json.ejs")),
        renderEJS(path.join(templatePath, "rollback.bat.ejs")),
        renderEJS(path.join(templatePath, "webpack.common.js.ejs")),
        renderEJS(path.join(templatePath, "webpack.dev.js.ejs")),
        renderEJS(path.join(templatePath, "webpack.prod.js.ejs"))
    ];

    const content = await Promise.all(renderPromises);
    writeToFile(path.join(rootDir, "dist/index.ejs"), content[0]);
    writeToFile(path.join(rootDir, "src/client/app.js"), content[1]);
    writeToFile(path.join(rootDir, "src/server/config/objection.js"), content[2]);
    writeToFile(path.join(rootDir, "src/server/routes/index.js"), content[3]);
    writeToFile(path.join(rootDir, "src/server/services/index.js"), content[4]);
    writeToFile(path.join(rootDir, "src/server/services/db/index.js"), content[5]);
    writeToFile(path.join(rootDir, "src/server/app.js"), content[6]);
    writeToFile(path.join(rootDir, ".babelrc"), content[7]);
    writeToFile(path.join(rootDir, ".eslintrc"), content[8]);
    writeToFile(path.join(rootDir, ".gitignore"), content[9]);
    writeToFile(path.join(rootDir, "knexfile.js"), content[10]);
    writeToFile(path.join(rootDir, "migrate.bat"), content[11]);
    writeToFile(path.join(rootDir, "nodemon.json"), content[12]);
    writeToFile(path.join(rootDir, "package.json"), content[13]);
    writeToFile(path.join(rootDir, "rollback.bat"), content[14]);
    writeToFile(path.join(rootDir, "webpack.common.js"), content[15]);
    writeToFile(path.join(rootDir, "webpack.dev.js"), content[16]);
    writeToFile(path.join(rootDir, "webpack.prod.js"), content[17]);

    const agilityConfigPath = path.join(rootDir, "agility.js");

    if (pathExists(agilityConfigPath)) {
        const agilityConfig = require(agilityConfigPath);
        const _models = agilityConfig.models;
        const relationString = agilityConfig.relations;
        const models = agilityParser.parse(_models, relationString);

        for (const model of models) generate(model);
    }

    log(`\nTHINGS TO DO`, "info");
    log(`************\n`, "info");
    log(`1. Run "npm install" to download dependencies`, "info");
    log(`2. Setup your Postgres and Mongo databases`, "info");
    log(`3. Add other columns to tables in your migration files and verify that your models and migrations are correct`, "info");
    log(`4. Include these variables in your environment: MONGODB_URI, DATABASE_URI and SESSION_SECRET`, "info");
    log(`5. Run "knex migrate:latest" to run your migrations`, "info");
    log(`6. Configure webpack if you'll be using a client interface`, "info");
    log(`7. Run "git init" if you want version management control`, "info");
    log(`8. Start the server with "npm start"`, "info");
};
