var ejs = require("ejs");
/**
 * This module returns the render of an ejs file
 * @param path Path to ejs file
 * @param params Parameters to be sent to the renderer
 */
module.exports = function (path, params) {
    if (params === void 0) { params = {}; }
    return new Promise(function (resolve, reject) {
        ejs.renderFile(path, params, function (err, content) {
            if (err)
                return reject(err);
            resolve(content);
        });
    });
};
