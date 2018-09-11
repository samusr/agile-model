var log = require("./log");
var fse = require("fs-extra");
/**
 * Writes to a file at a specified path.
 * @param path Path of folder to be created
 */
module.exports = function (path, data) {
    if (data === void 0) { data = ""; }
    return new Promise(function (resolve, reject) {
        try {
            fse.writeFile(path, data, function (err) {
                if (err) {
                    log.error("Unable to write to file at " + path, err);
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
