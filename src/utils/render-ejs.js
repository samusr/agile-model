const ejs = require("ejs");

/**
 * This module returns the render of an ejs file
 * @param path Path to ejs file
 * @param params Parameters to be sent to the renderer
 */
const renderEJS = (path, params = {}) => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(path, params, (err, content) => {
            if (err) return reject(err);
            return resolve(content);
        });
    });
};

module.exports = renderEJS;
