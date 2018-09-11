var path = require("path");
var fse = require("fs-extra");
var pathExists = require("./path-exists");
var log = require("./log");
/**
 * This module returns an array of paths of all folders at particular search path.
 * The search path must be a folder path.
 * @param path The path to search
 */
module.exports = function (folderPath) {
    return new Promise(function (resolve, reject) {
        try {
            if (!pathExists(folderPath)) {
                log("Search path does not exist", "error");
                return reject();
            }
            if (!fse.lstatSync(folderPath).isDirectory()) {
                log("Search path is not a directory", "error");
                return reject();
            }
            fse.readdir(folderPath, function (err, files) {
                if (err) {
                    log("Unable to read folders at " + folderPath + ": " + err, "error");
                    return reject(err);
                }
                files = files.filter(function (file) {
                    return fse.lstatSync(path.resolve(folderPath, file)).isDirectory();
                });
                resolve(files);
            });
        }
        catch (err) {
            reject(err);
        }
    });
};
