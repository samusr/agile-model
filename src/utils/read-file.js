const fse = require("fs-extra");

/**
 * Reads a file at a specified path returninig all its contents as a string.
 * @param path Path of folder to be created
 */
const readFile = path => {
    return fse.readFileSync(path, { encoding: "utf-8" });
};

module.exports = readFile;
