const path = require("path");
const fse = require("fs-extra");
const pathExists = require("./path-exists");
const log = require("./log");

/**
 * This module returns an array of paths of all folders at particular search path.
 * The search path must be a folder path.
 * @param path The path to search
 */
const readFolder = folderPath => {
    if (!pathExists(folderPath)) {
        log("Search path does not exist", "error");
        throw new Error("Search path does not exist");
    }

    if (!fse.lstatSync(folderPath).isDirectory()) {
        log("Search path is not a directory", "error");
        throw new Error("Search path is not a directory");
    }

    const folderContents = fse.readdirSync(folderPath, { encoding: "utf-8" });

    return folderContents.filter(content => fse.lstatSync(path.join(folderPath, content)).isDirectory());
};

module.exports = readFolder;
