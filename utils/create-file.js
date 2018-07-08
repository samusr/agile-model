const log = require("./log");
const fse = require("fs-extra");

/**
 * Asynchronously creates a file at a specified path.
 *
 * @param path Path of file to be created
 */

module.exports = function(path) {
    return new Promise(function(resolve, reject) {
        try {
            fse.ensureFile(path, err => {
                if (err) {
                    log.error(`Unable to create file at ${path}: `, err);
                    return reject(err);
                }

                log.success(`File created at ${path}`);
                return resolve();
            });
        } catch (err) {
            return reject(err);
        }
    });
};
