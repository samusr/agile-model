const log = require("./log");
const fse = require("fs-extra");

/**
 * Writes to a file at a specified path.
 * @param path Path of folder to be created
 */

module.exports = (path, data = "") => {
	return new Promise(function(resolve, reject) {
		try {
			fse.writeFile(path, data, err => {
				if (err) {
					log.error(`Unable to write to file at ${path}`, err);
					return reject(err);
				}

				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};
