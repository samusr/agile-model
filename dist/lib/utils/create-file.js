var fse = require("fs-extra");
var log = require("./log");
/**
 * Creates a file at a specified path.
 * @param path Path of file to be created
 */
module.exports = function (path) {
    return new Promise(function (resolve, reject) {
        try {
            fse.ensureFile(path, function (err) {
                if (err) {
                    log("Unable to create file at " + path + ": " + err, "error");
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
