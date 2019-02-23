const log = require("./log");
const spinner = require("./spinner");
const readFile = require("./read-file");
const renderEJS = require("./render-ejs");
const readFolder = require("./read-folder");
const createFile = require("./create-file");
const createFolder = require("./create-folder");
const deleteObject = require("./delete-object");
const pathExists = require("./path-exists");
const getRootDir = require("./get-root-dir");
const writeToFile = require("./write-to-file");
const namesGenerator = require("./generate-names");
const arrayTostringShim = require("./array-tostring-shim");

module.exports = {
    log,
    spinner,
    getRootDir,
    createFile,
    createFolder,
    deleteObject,
    pathExists,
    readFile,
    readFolder,
    renderEJS,
    writeToFile,
    namesGenerator,
    arrayTostringShim
};
