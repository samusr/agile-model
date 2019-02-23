const fse = require("fs-extra");
const pathExists = require("./path-exists");
const log = require("./log");

/**
 * Deletes a folder or file.  If a folder exists at the path, all its contents are also removed.
 * @param path path of target file or folder
 */
const deleteObject = path => {
	if (pathExists(path)) {
		fse.removeSync(path);
		log(`Object removed @ ${path}`, "info");
	} else log("Path does not exist", "info");
};

module.exports = deleteObject;
