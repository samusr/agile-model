const log = require("./log");
const pathExists = require("./path-exists");
const fse = require("fs-extra");

/**
 * Asynchronously removes a folder or file. If a folder exists at the path, all its
 * contents are also removed.
 */

module.exports = function(path) {
    return new Promise(function(resolve, reject) {
        try {
            if (!pathExists(path)) {
                log.info(`[${path}] does not exist`);
                return resolve();
            }

            fse.remove(path, err => {
                if (err) {
                    console.error(`Unable to remove file/folder at ${path}: `, err);
                    return reject(err);
                }

                return resolve();
            });
        } catch (err) {
            return reject(err);
        }
    });
};
