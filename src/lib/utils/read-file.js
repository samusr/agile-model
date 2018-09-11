const fse = require("fs-extra");
const log = require("./log");

/**
 * Reads a file at a specified path returninig all its contents as a string.
 * @param path Path of folder to be created
 */

module.exports = path => {
	return new Promise((resolve, reject) => {
		try {
			fse.readFile(path, "utf-8", (err, data) => {
				if (err) {
					log(`Unable to read file at ${path}: ${err}`, "error");
					return reject(err);
				}

				resolve(data);
			});
		} catch (err) {
			reject(err);
		}
	});
};
