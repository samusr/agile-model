const ejs = require("ejs");

/**
 * This module returns the render of an ejs file
 * @param path Path to ejs file
 * @param params Parameters to be sent to the renderer
 */
const renderEJS = async (path, params = {}) => {
    const renderOutputPromise = new Promise((resolve, reject) => {
        ejs.renderFile(path, params, (err, content) => {
            if (err) return reject(err);
            resolve(content);
        });
    });

    const renderOutput = await renderOutputPromise;
    return renderOutput;
};

module.exports = renderEJS;
