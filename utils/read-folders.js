const path = require("path");
const fse = require("fs-extra");
const log = require("./log");
const pathExists = require("./path-exists");

/**
 * This module returns an array of paths of all folders at particular search path.
 * The search path must be a folder path.
 *
 * @param searchPath The path to search
 */

module.exports = function(searchPath) {
    return new Promise(function(resolve, reject) {
        try {
            if (!pathExists(searchPath)) {
                log.error("Search path does not exist");
                throw new Error("Search path does not exist");
            }

            if (!fse.lstatSync(searchPath).isDirectory()) {
                log.error("Search path is not a directory");
                throw new Error("Search path is not a directory");
            }

            fse.readdir(searchPath, function(err, files) {
                if (err) return reject(err);

                files = files.filter(function(file) {
                    return fse.lstatSync(path.resolve(searchPath, file)).isDirectory();
                });

                return resolve(files);
            });
        } catch (err) {
            return reject(err);
        }
    });
};
