const fse = require("fs-extra");
const pathExists = require("./path-exists");
const log = require("./log");

/**
 * Deletes a folder or file.  If a folder exists at the path, all its contents are also removed.
 * @param path path of target file or folder
 */

module.exports = path => {
	return new Promise(function(resolve, reject) {
		try {
			if (!pathExists(path)) {
				log("Path does not exist", "info");
				return reject();
			}

			fse.remove(path, err => {
				if (err) {
					log(`Unable to remove file/folder at ${path}: ${err}`, "error");
					return reject(err);
				}

				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};
