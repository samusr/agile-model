const fse = require("fs-extra");

/**
 * Reads a file at a given path returninig its contents as a string.
 * @param path Path of folder to be created
 */
const readFile = path => fse.readFileSync(path, { encoding: "utf-8" });

module.exports = readFile;
