const fse = require("fs-extra");
const log = require("./log");

/**
 * Creates a file at a given path.
 * @param path Path of file to be created
 */
const createFile = path => {
	fse.ensureFileSync(path);
	log(`File created @ ${path}`, "info");
};

module.exports = createFile;
