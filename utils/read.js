const log = require("./log");
const fse = require("fs-extra");

/**
 * Asynchronously reads a file at a specified path returninig all its contents as a string.
 *
 * @param path Path of folder to be created
 */

module.exports = function(path) {
    return new Promise(function(resolve, reject) {
        try {
            fse.readFile(path, "utf-8", function(err, data) {
                if (err) {
                    log.error(`Unable to read file at ${path}`, err);
                    return reject(err);
                }

                log.success(`Successfully read file at ${path}`);
                return resolve(data);
            });
        } catch (err) {
            return reject(err);
        }
    });
};
