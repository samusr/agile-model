/**
 * This utility checks the returns a true indicating the existence of a file, false otherwise
 */

const fse = require("fs-extra");

module.exports = function(path) {
    return fse.pathExistsSync(path);
};
