const log = require("./log");
const fse = require("fs-extra");

/**
 * Asynchronously creates a folder at a specified path.
 *
 * @param path Path of folder to be created
 */

module.exports = function(path) {
    return new Promise(function(resolve, reject) {
        try {
            fse.ensureDir(path, err => {
                if (err) {
                    log.error(`Unable to create folder at ${path}: `, err);
                    return reject(err);
                }

                log.success(`Folder created at ${path}`);
                return resolve();
            });
        } catch (err) {
            return reject(err);
        }
    });
};
