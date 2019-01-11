const fse = require("fs-extra");

/**
 * This utility checks if a file exists
 */
module.exports = path => {
    return fse.pathExistsSync(path);
};
