const createFile = require("./create-file");
const createFolder = require("./create-folder");
const deleteFile = require("./delete-file");
const log = require("./log");
const pathExists = require("./path-exists");
const readFile = require("./read-file");
const readFolder = require("./read-folder");
const renderEJS = require("./render-ejs");
const spinner = require("./spinner");
const writeToFile = require("./write-to-file");

module.exports = { createFile, createFolder, deleteFile, log, pathExists, readFile, readFolder, renderEJS, spinner, writeToFile };
