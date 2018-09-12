var createFile = require("./create-file");
var createFolder = require("./create-folder");
var deleteFile = require("./delete-file");
var log = require("./log");
var pathExists = require("./path-exists");
var readFile = require("./read-file");
var readFolder = require("./read-folder");
var renderEJS = require("./render-ejs");
var spinner = require("./spinner");
var writeToFile = require("./write-to-file");
var generateNames = require("./generate-names");
var arrayTostringShim = require("./array-tostring-shim");
module.exports = {
    createFile: createFile,
    createFolder: createFolder,
    deleteFile: deleteFile,
    log: log,
    pathExists: pathExists,
    readFile: readFile,
    readFolder: readFolder,
    renderEJS: renderEJS,
    spinner: spinner,
    writeToFile: writeToFile,
    generateNames: generateNames,
    arrayTostringShim: arrayTostringShim
};
