/**
 * This utility checks if a file exists
 */
var fse = require("fs-extra");
module.exports = function (path) {
    return fse.pathExistsSync(path);
};
