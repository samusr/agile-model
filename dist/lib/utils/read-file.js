var fse = require("fs-extra");
var log = require("./log");
/**
 * Reads a file at a specified path returninig all its contents as a string.
 * @param path Path of folder to be created
 */
module.exports = function (path) {
    return new Promise(function (resolve, reject) {
        try {
            fse.readFile(path, "utf-8", function (err, data) {
                if (err) {
                    log("Unable to read file at " + path + ": " + err, "error");
                    return reject(err);
                }
                resolve(data);
            });
        }
        catch (err) {
            reject(err);
        }
    });
};
