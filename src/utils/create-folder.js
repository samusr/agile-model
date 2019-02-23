const fse = require("fs-extra");
const log = require("./log");

/**
 * Creates a folder at a specified path.
 * @param path Path of folder to be created
 */
const createFolder = path => {
    fse.ensureDirSync(path);
    log(`Folder created @ ${path}`, "info");
};

module.exports = createFolder;
