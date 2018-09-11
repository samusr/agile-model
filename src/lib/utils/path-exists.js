/**
 * This utility checks if a file exists
 */

const fse = require("fs-extra");

module.exports = path => {
	return fse.pathExistsSync(path);
};
