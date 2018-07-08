const log = require("./log");
const fse = require("fs-extra");

/**
 * Asynchronously writes to a file at a specified path.
 *
 * @param path Path of folder to be created
 */

module.exports = function(path, data = "") {
    return new Promise(function(resolve, reject) {
        try {
            fse.writeFile(path, data, function(err) {
                if (err) {
                    log.error(`Unable to write to file at ${path}`, err);
                    return reject(err);
                }

                log.success(`Successfully written to file at ${path}`);
                return resolve();
            });
        } catch (err) {
            return reject(err);
        }
    });
};
