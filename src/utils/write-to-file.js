const log = require("./log");
const fse = require("fs-extra");

/**
 * Writes to a file at a specified path.
 * @param path Path of folder to be created
 */
const writeToFile = (path, data = "") => {
    fse.writeFileSync(path, data);
    log(`File written to @ ${path}`, "info");
};

module.exports = writeToFile;
