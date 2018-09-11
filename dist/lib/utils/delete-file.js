var fse = require("fs-extra");
var pathExists = require("./path-exists");
var log = require("./log");
/**
 * Deletes a folder or file.  If a folder exists at the path, all its contents are also removed.
 */
module.exports = function (path) {
    return new Promise(function (resolve, reject) {
        try {
            if (!pathExists(path)) {
                log("Path does not exist", "info");
                return reject();
            }
            fse.remove(path, function (err) {
                if (err) {
                    log("Unable to remove file/folder at " + path + ": " + err, "error");
                    return reject(err);
                }
                resolve();
            });
        }
        catch (err) {
            reject(err);
        }
    });
};
