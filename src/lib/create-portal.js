const path = require("path");
const { renderEJS, getRootDir, createFile, createFolder, writeToFile, readFolder } = require("../utils");

/**
 * Creates the client-side files and folders that represent a portal
 * It also modifies /src/server/routes/index file and the /webpack.common.js files
 * to add the portal to the build pipeline
 *
 * @param {string} portalName The name of the portal
 */
module.exports = async portalName => {
    const srcRootDir = path.join(getRootDir(), `src/client/${portalName}`);
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

    const ejsParams = { portal: portalName };
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

    // Create /dist folder entry containing the /[portalName]/index.ejs
    const distRootDir = path.join(getRootDir(), `dist/${portalName}`);
    createFolder(distRootDir);
    createFile(path.join(distRootDir, "index.ejs"));
    const distContent = await renderEJS(path.join(__dirname, "../template/client/index.ejs"), ejsParams);
    writeToFile(path.join(distRootDir, "index.ejs"), distContent);

    // Modify the routes index file and webpack.common.js
    const portalFolderGroups = readFolder(path.join(getRootDir(), "/dist"), "folder");
    const renderArgs = { portals: portalFolderGroups };
    const routeRelatedRenderEJSPromises = [
        renderEJS(path.join(__dirname, "../template/server/routes/index.js.ejs"), renderArgs),
        renderEJS(path.join(__dirname, "../template/webpack.common.js.ejs"), renderArgs)
    ];
    const routeRelatedContent = await Promise.all(routeRelatedRenderEJSPromises);
    writeToFile(path.join(getRootDir(), "src/server/routes/index.js"), routeRelatedContent[0]);
    writeToFile(path.join(getRootDir(), "webpack.common.js"), routeRelatedContent[1]);
};
