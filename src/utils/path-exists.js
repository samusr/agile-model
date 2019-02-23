const fse = require("fs-extra");

/**
 * Checks if a file exists at the given path
 */
module.exports = path => fse.pathExistsSync(path);
