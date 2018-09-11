const fse = require("fs-extra");
const log = require("./log");

/**
 * Creates a file at a specified path.
 * @param path Path of file to be created
 */

module.exports = path => {
	return new Promise((resolve, reject) => {
		try {
			fse.ensureFile(path, err => {
				if (err) {
					log(`Unable to create file at ${path}: ${err}`, "error");
					return reject(err);
				}

				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};
