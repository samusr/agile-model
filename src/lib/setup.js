const path = require("path");
const generate = require("./generate");
const agilityParser = require("./agility-parser");
const { pathExists, renderEJS, getRootDir, log, createFile, createFolder, writeToFile } = require("../utils");

/**
 * Configures the project foder
 */
module.exports = async () => {
    const rootDir = getRootDir();
    const models = [];
    const portals = [];

    if (pathExists(path.join(rootDir, "agility.js"))) {
        const agilityConfig = require(path.join(rootDir, "agility.js"));
        models.push(...agilityParser.parse(agilityConfig.models, agilityConfig.relations));
        portals.push(...agilityConfig.portals);
    }

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

    const renderEJSPromises = [
        renderEJS(path.join(__dirname, "../template/server/config/objection.js.ejs")),
        renderEJS(path.join(__dirname, "../template/server/routes/index.js.ejs"), { portals }),
        renderEJS(path.join(__dirname, "../template/server/services/index.js.ejs")),
        renderEJS(path.join(__dirname, "../template/server/services/db/index.js.ejs")),
        renderEJS(path.join(__dirname, "../template/server/app.js.ejs")),
        renderEJS(path.join(__dirname, "../template/.babelrc.ejs")),
        renderEJS(path.join(__dirname, "../template/.eslintrc.ejs")),
        renderEJS(path.join(__dirname, "../template/.gitignore.ejs")),
        renderEJS(path.join(__dirname, "../template/knexfile.js.ejs")),
        renderEJS(path.join(__dirname, "../template/migrate.bat.ejs")),
        renderEJS(path.join(__dirname, "../template/nodemon.json.ejs")),
        renderEJS(path.join(__dirname, "../template/package.json.ejs")),
        renderEJS(path.join(__dirname, "../template/rollback.bat.ejs")),
        renderEJS(path.join(__dirname, "../template/webpack.common.js.ejs"), { portals }),
        renderEJS(path.join(__dirname, "../template/webpack.dev.js.ejs")),
        renderEJS(path.join(__dirname, "../template/webpack.prod.js.ejs"))
    ];

    const content = await Promise.all(renderEJSPromises);
    writeToFile(path.join(rootDir, "src/server/config/objection.js"), content[0]);
    writeToFile(path.join(rootDir, "src/server/routes/index.js"), content[1]);
    writeToFile(path.join(rootDir, "src/server/services/index.js"), content[2]);
    writeToFile(path.join(rootDir, "src/server/services/db/index.js"), content[3]);
    writeToFile(path.join(rootDir, "src/server/app.js"), content[4]);
    writeToFile(path.join(rootDir, ".babelrc"), content[5]);
    writeToFile(path.join(rootDir, ".eslintrc"), content[6]);
    writeToFile(path.join(rootDir, ".gitignore"), content[7]);
    writeToFile(path.join(rootDir, "knexfile.js"), content[8]);
    writeToFile(path.join(rootDir, "migrate.bat"), content[9]);
    writeToFile(path.join(rootDir, "nodemon.json"), content[10]);
    writeToFile(path.join(rootDir, "package.json"), content[11]);
    writeToFile(path.join(rootDir, "rollback.bat"), content[12]);
    writeToFile(path.join(rootDir, "webpack.common.js"), content[13]);
    writeToFile(path.join(rootDir, "webpack.dev.js"), content[14]);
    writeToFile(path.join(rootDir, "webpack.prod.js"), content[15]);

    // Generate models specified in the agilit.js file
    for (const model of models) await generate(model);

    // Create portals specified in the agility.js file
    await generatePortalFilesAndFolders(portals);

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

/**
 * Creates the portals files and folders for each portal in the portal strings array
 *
 * @param {string[]} portals - Portals string array
 */
const generatePortalFilesAndFolders = async portals => {
    if (portals.length == 0) return;

    for (const portal of portals) {
        // Create /src/client files and folders

        const srcRootDir = path.join(getRootDir(), `src/client/${portal}`);
        createFolder(srcRootDir);
        createFolder(path.join(srcRootDir, "/actions"));
        createFolder(path.join(srcRootDir, "/assets"));
        createFolder(path.join(srcRootDir, "/config"));
        createFolder(path.join(srcRootDir, "/pages"));
        createFolder(path.join(srcRootDir, "/pages/404"));
        createFolder(path.join(srcRootDir, "/pages/base"));
        createFolder(path.join(srcRootDir, "/pages/login"));
        createFolder(path.join(srcRootDir, "/pages/components"));
        createFolder(path.join(srcRootDir, "/pages/components/auth-container"));
        createFolder(path.join(srcRootDir, "/pages/components/flash"));
        createFolder(path.join(srcRootDir, "/pages/components/page-container"));
        createFolder(path.join(srcRootDir, "/reducers"));

        createFile(path.join(srcRootDir, "/actions/flash-actions.js"));
        createFile(path.join(srcRootDir, "/actions/loading-actions.js"));
        createFile(path.join(srcRootDir, "/config/action-types.js"));
        createFile(path.join(srcRootDir, "/config/loading-entries.js"));
        createFile(path.join(srcRootDir, "/config/url.js"));
        createFile(path.join(srcRootDir, "/pages/404/index.jsx"));
        createFile(path.join(srcRootDir, "/pages/base/index.jsx"));
        createFile(path.join(srcRootDir, "/pages/components/auth-container/index.jsx"));
        createFile(path.join(srcRootDir, "/pages/components/flash/index.jsx"));
        createFile(path.join(srcRootDir, "/pages/components/flash/index.scss"));
        createFile(path.join(srcRootDir, "/pages/components/page-container/index.jsx"));
        createFile(path.join(srcRootDir, "/pages/components/index.js"));
        createFile(path.join(srcRootDir, "/pages/login/index.jsx"));
        createFile(path.join(srcRootDir, "/pages/login/index.scss"));
        createFile(path.join(srcRootDir, "/pages/login/login-form.jsx"));
        createFile(path.join(srcRootDir, "/pages/login/login-form.scss"));
        createFile(path.join(srcRootDir, "/reducers/flash-reducer.js"));
        createFile(path.join(srcRootDir, "/reducers/index.js"));
        createFile(path.join(srcRootDir, "/reducers/loading-reducer.js"));
        createFile(path.join(srcRootDir, "/index.js"));
        createFile(path.join(srcRootDir, "/index.scss"));

        const ejsParams = { portal };
        const srcRenderEJSPromises = [
            renderEJS(path.join(__dirname, "../template/client/portal/actions/flash-actions.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/actions/loading-actions.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/config/action-types.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/config/loading-entries.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/config/url.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/404/index.jsx.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/base/index.jsx.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/components/auth-container/index.jsx.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/components/flash/index.jsx.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/components/flash/index.scss.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/components/page-container/index.jsx.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/components/index.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/login/index.jsx.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/login/index.scss.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/login/login-form.jsx.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/pages/login/login-form.scss.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/reducers/flash-reducer.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/reducers/index.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/reducers/loading-reducer.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/index.js.ejs"), ejsParams),
            renderEJS(path.join(__dirname, "../template/client/portal/index.scss.ejs"), ejsParams)
        ];

        const srcContent = await Promise.all(srcRenderEJSPromises);
        writeToFile(path.join(srcRootDir, "/actions/flash-actions.js"), srcContent[0]);
        writeToFile(path.join(srcRootDir, "/actions/loading-actions.js"), srcContent[1]);
        writeToFile(path.join(srcRootDir, "/config/action-types.js"), srcContent[2]);
        writeToFile(path.join(srcRootDir, "/config/loading-entries.js"), srcContent[3]);
        writeToFile(path.join(srcRootDir, "/config/url.js"), srcContent[4]);
        writeToFile(path.join(srcRootDir, "/pages/404/index.jsx"), srcContent[5]);
        writeToFile(path.join(srcRootDir, "/pages/base/index.jsx"), srcContent[6]);
        writeToFile(path.join(srcRootDir, "/pages/components/auth-container/index.jsx"), srcContent[7]);
        writeToFile(path.join(srcRootDir, "/pages/components/flash/index.jsx"), srcContent[8]);
        writeToFile(path.join(srcRootDir, "/pages/components/flash/index.scss"), srcContent[9]);
        writeToFile(path.join(srcRootDir, "/pages/components/page-container/index.jsx"), srcContent[10]);
        writeToFile(path.join(srcRootDir, "/pages/components/index.js"), srcContent[11]);
        writeToFile(path.join(srcRootDir, "/pages/login/index.jsx"), srcContent[12]);
        writeToFile(path.join(srcRootDir, "/pages/login/index.scss"), srcContent[13]);
        writeToFile(path.join(srcRootDir, "/pages/login/login-form.jsx"), srcContent[14]);
        writeToFile(path.join(srcRootDir, "/pages/login/login-form.scss"), srcContent[15]);
        writeToFile(path.join(srcRootDir, "/reducers/flash-reducer.js"), srcContent[16]);
        writeToFile(path.join(srcRootDir, "/reducers/index.js"), srcContent[17]);
        writeToFile(path.join(srcRootDir, "/reducers/loading-reducer.js"), srcContent[18]);
        writeToFile(path.join(srcRootDir, "/index.js"), srcContent[19]);
        writeToFile(path.join(srcRootDir, "/index.scss"), srcContent[20]);

        // Create /dist files and folders
        const distRootDir = path.join(getRootDir(), `dist/${portal}`);

        createFolder(distRootDir);
        createFile(path.join(distRootDir, "index.ejs"));
        const distContent = await renderEJS(path.join(__dirname, "../template/client/index.ejs"), ejsParams);
        writeToFile(path.join(distRootDir, "index.ejs"), distContent);
    }
};
