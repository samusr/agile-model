const ejs = require("ejs");

/**
 * This module wraps the ejs callback function in a promise
 *
 * @param path Path of ejs file
 * @param data Object of parameters to be injected into ejs
 */

module.exports = function(path, data) {
    return new Promise(function(resolve, reject) {
        ejs.renderFile(path, data, function(err, str) {
            if (err) return reject(err);

            return resolve(str);
        });
    });
};
