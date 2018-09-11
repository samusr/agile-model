var log = require("./log");
var fse = require("fs-extra");
/**
 * Creates a folder at a specified path.
 * @param path Path of folder to be created
 */
module.exports = function (path) {
    return new Promise(function (resolve, reject) {
        try {
            fse.ensureDir(path, function (err) {
                if (err) {
                    log("Unable to create folder at " + path + ": " + err, "error");
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
