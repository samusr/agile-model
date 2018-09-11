/**
 * This configures the objection config as well as services and migrations folders
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var path = require("path");
var exec = require("child_process").exec;
var generate = require("./generate");
var generateModelGraph = require("./generate-model-graph");
var _a = require("../utils"), read = _a.read, pathExists = _a.pathExists, write = _a.write, createFile = _a.createFile, createFolder = _a.createFolder, log = _a.log, spinner = _a.spinner, promisifyEjs = _a.promisifyEjs;
module.exports = function (args) {
    return __awaiter(this, void 0, void 0, function () {
        var databaseClient, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    databaseClient = args.database;
                    // Install knex
                    return [4 /*yield*/, installPackage("knex")];
                case 1:
                    // Install knex
                    _a.sent();
                    // Install objection
                    return [4 /*yield*/, installPackage("objection")];
                case 2:
                    // Install objection
                    _a.sent();
                    // Install database client
                    return [4 /*yield*/, installPackage(databaseClient)];
                case 3:
                    // Install database client
                    _a.sent();
                    // Configure knex
                    return [4 /*yield*/, configureKnex(databaseClient)];
                case 4:
                    // Configure knex
                    _a.sent();
                    // Configure objection
                    return [4 /*yield*/, configureObjection()];
                case 5:
                    // Configure objection
                    _a.sent();
                    // Create additional files folders
                    return [4 /*yield*/, createAdditionalFilesAndFolders()];
                case 6:
                    // Create additional files folders
                    _a.sent();
                    // Process agility.js (If any)
                    return [4 /*yield*/, processAgilityConfig(args)];
                case 7:
                    // Process agility.js (If any)
                    _a.sent();
                    log.warning("\nRun \"knex migrate:latest\" to execute the latest migrations");
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _a.sent();
                    log.error(err_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
};
function getPackageJSON() {
    return __awaiter(this, void 0, void 0, function () {
        var packageJsonPath, packageJsonString;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    packageJsonPath = path.join(process.cwd(), "/package.json");
                    return [4 /*yield*/, read(packageJsonPath)];
                case 1:
                    packageJsonString = _a.sent();
                    return [2 /*return*/, JSON.parse(packageJsonString)];
            }
        });
    });
}
function installPackage(packageName) {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var packageJson, installer, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, getPackageJSON()];
                    case 1:
                        packageJson = _a.sent();
                        if (!packageJson.dependencies[packageName]) {
                            log.warning(packageName + " not found");
                            log.info("Installing " + packageName);
                            log.info("Running 'npm install " + packageName + " --save'. Please wait for installation to complete...");
                            installer = exec("npm install " + packageName + " --save");
                            spinner.start();
                            installer.on("exit", function () {
                                spinner.stop();
                                log.info(packageName + " has been installed");
                                return resolve();
                            });
                            installer.on("error", function (err) {
                                spinner.stop();
                                console.error("An error occurred with the installation of " + packageName + ". Please try again");
                                console.error("If this error persists, try running 'npm install " + packageName + "--save' manually");
                                return reject(err);
                            });
                        }
                        else {
                            spinner.stop();
                            log.info(packageName + " is already installed. Skipping installation");
                            return [2 /*return*/, resolve()];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        spinner.stop();
                        return [2 /*return*/, reject(err_2)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
}
function configureKnex(databaseClient) {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var knexfilePath, knexfileTemplatePath, content, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        log.info("Configuring knex. Please wait...");
                        knexfilePath = path.join(process.cwd(), "/knexfile.js");
                        return [4 /*yield*/, createFile(knexfilePath)];
                    case 1:
                        _a.sent();
                        knexfileTemplatePath = path.join(__dirname, "../template/knexfile.js.ejs");
                        return [4 /*yield*/, promisifyEjs(knexfileTemplatePath, { client: databaseClient })];
                    case 2:
                        content = _a.sent();
                        return [4 /*yield*/, write(knexfilePath, content)];
                    case 3:
                        _a.sent();
                        log.info("Knex configuration complete.");
                        return [2 /*return*/, resolve()];
                    case 4:
                        err_3 = _a.sent();
                        return [2 /*return*/, reject(err_3)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    });
}
function configureObjection() {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var configFolderPath, objectionConfigFilePath, objectionTemplatePath, content, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        log.info("Configuring objection. Please wait...");
                        configFolderPath = path.join(process.cwd(), "/config");
                        objectionConfigFilePath = path.join(process.cwd(), "/config/objection.js");
                        return [4 /*yield*/, createFolder(configFolderPath)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, createFile(objectionConfigFilePath)];
                    case 2:
                        _a.sent();
                        objectionTemplatePath = path.join(__dirname, "../template/config/objection.js.ejs");
                        return [4 /*yield*/, promisifyEjs(objectionTemplatePath, {})];
                    case 3:
                        content = _a.sent();
                        return [4 /*yield*/, write(objectionConfigFilePath, content)];
                    case 4:
                        _a.sent();
                        log.info("Objection configuration complete.");
                        return [2 /*return*/, resolve()];
                    case 5:
                        err_4 = _a.sent();
                        return [2 /*return*/, reject(err_4)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    });
}
function createAdditionalFilesAndFolders() {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var dbIndexFilePath, promises, dbIndexTemplateFilePath, content, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        log.info("Creating additional files and folders");
                        dbIndexFilePath = path.join(process.cwd(), "/services/db/index.js");
                        promises = [
                            createFolder(path.join(process.cwd(), "/models")),
                            createFolder(path.join(process.cwd(), "/migrations")),
                            createFolder(path.join(process.cwd(), "/services")),
                            createFolder(path.join(process.cwd(), "/services/db")),
                            createFile(path.join(dbIndexFilePath))
                        ];
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        dbIndexTemplateFilePath = path.join(__dirname, "../template/services/db/index.js.ejs");
                        return [4 /*yield*/, promisifyEjs(dbIndexTemplateFilePath)];
                    case 2:
                        content = _a.sent();
                        return [4 /*yield*/, write(dbIndexFilePath, content)];
                    case 3:
                        _a.sent();
                        log.info("Finished creating additional files and folders");
                        return [2 /*return*/, resolve()];
                    case 4:
                        err_5 = _a.sent();
                        return [2 /*return*/, reject(err_5)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    });
}
function processAgilityConfig(args) {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var agilityConfigPath, agilityConfig, models, relationString, modelGraph, _i, modelGraph_1, model, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        log.info("Processing agility.config.js");
                        agilityConfigPath = path.join(process.cwd(), "/agility.js");
                        if (!pathExists(agilityConfigPath)) {
                            log.info("No agility.js file found in root. If you want to use this file, please run \"agile-model init\"");
                            return [2 /*return*/, resolve()];
                        }
                        agilityConfig = require(agilityConfigPath);
                        models = agilityConfig.models;
                        relationString = agilityConfig.relations;
                        modelGraph = generateModelGraph(models, relationString);
                        _i = 0, modelGraph_1 = modelGraph;
                        _a.label = 1;
                    case 1:
                        if (!(_i < modelGraph_1.length)) return [3 /*break*/, 4];
                        model = modelGraph_1[_i];
                        return [4 /*yield*/, generate(model, args)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        log.info("Finished processing agility.js");
                        return [2 /*return*/, resolve()];
                    case 5:
                        err_6 = _a.sent();
                        return [2 /*return*/, reject(err_6)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    });
}
