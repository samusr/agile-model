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
var _ = require("lodash");
var path = require("path");
var moment = require("moment");
var pluralize = require("pluralize");
var generateModelGraph = require("./generate-model-graph");
var _a = require("../utils"), createFile = _a.createFile, createFolder = _a.createFolder, readFolders = _a.readFolders, promisifyEjs = _a.promisifyEjs, write = _a.write, log = _a.log, spinner = _a.spinner;
/**
 * This module is used to generate a model within your app. Then it generates the migration file
 * that creates in your database. It also adds a db service group to /services/db corresponding
 * to the model
 */
module.exports = function (model, args) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    if (typeof model == "string") {
                        model = generateModelGraph([model], "")[0];
                    }
                    return [4 /*yield*/, createModelFile(model)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, createMigrationFiles(model)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, createDBServiceFiles(model)];
                case 3:
                    _a.sent();
                    if (!args.routes) return [3 /*break*/, 5];
                    return [4 /*yield*/, createRouteFiles(model)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (!args.views) return [3 /*break*/, 7];
                    return [4 /*yield*/, createViewFiles(model, args.ext)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    err_1 = _a.sent();
                    log.error(err_1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
};
function createModelFile(model) {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var modelPath, modelTemplatePath, content, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        log.info("Creating model \"" + model.name + "\"");
                        spinner.start();
                        modelPath = path.join(process.cwd(), "/models/", model.file);
                        // Create model file
                        return [4 /*yield*/, createFile(modelPath)];
                    case 1:
                        // Create model file
                        _a.sent();
                        modelTemplatePath = path.join(__dirname, "../template/models/model.js.ejs");
                        return [4 /*yield*/, promisifyEjs(modelTemplatePath, { model: model })];
                    case 2:
                        content = _a.sent();
                        return [4 /*yield*/, write(modelPath, content)];
                    case 3:
                        _a.sent();
                        log.info("Model Created!");
                        spinner.stop();
                        return [2 /*return*/, resolve()];
                    case 4:
                        err_2 = _a.sent();
                        spinner.stop();
                        return [2 /*return*/, reject(err_2)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    });
}
function createMigrationFiles(model) {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var migrationFilePath, content, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        log.info("Creating Migration File For \"" + model.name + "\"");
                        spinner.start();
                        migrationFilePath = path.join(process.cwd(), "/migrations/", moment().format("YYYYMMDDHHmmss") + "_create_" + model.table + "_table.js");
                        return [4 /*yield*/, createFile(migrationFilePath)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, promisifyEjs(path.join(__dirname, "../template/migrations/migration.js.ejs"), { model: model, pluralize: pluralize })];
                    case 2:
                        content = _a.sent();
                        return [4 /*yield*/, write(migrationFilePath, content)];
                    case 3:
                        _a.sent();
                        log.info("Migration File Created!");
                        spinner.stop();
                        return [2 /*return*/, resolve()];
                    case 4:
                        err_3 = _a.sent();
                        spinner.stop();
                        return [2 /*return*/, reject(err_3)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    });
}
function createDBServiceFiles(model) {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var modelFileName, createPromises, args, readTemplatePromises, fileContents, writePromises, dbIndexText, modelFolderGroups, _i, modelFolderGroups_1, group, _a, modelFolderGroups_2, group, err_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        log.info("Creating db files");
                        spinner.start();
                        modelFileName = model.file.split(".")[0];
                        createPromises = [
                            createFolder(path.join(process.cwd(), "/services/db/", modelFileName)),
                            createFile(path.join(process.cwd(), "/services/db/", modelFileName, "index.js")),
                            createFile(path.join(process.cwd(), "/services/db/", modelFileName, "create.js")),
                            createFile(path.join(process.cwd(), "/services/db/", modelFileName, "edit.js")),
                            createFile(path.join(process.cwd(), "/services/db/", modelFileName, "destroy.js")),
                            createFile(path.join(process.cwd(), "/services/db/", modelFileName, "find-by-id.js")),
                            createFile(path.join(process.cwd(), "/services/db/", modelFileName, "find-all.js")),
                            createFile(path.join(process.cwd(), "/services/db/", modelFileName, "find-where-conditions.js"))
                        ];
                        return [4 /*yield*/, Promise.all(createPromises)];
                    case 1:
                        _b.sent();
                        args = {
                            modelName: model.name,
                            modelFileName: modelFileName
                        };
                        readTemplatePromises = [
                            promisifyEjs(path.join(__dirname, "../template/services/db/entity/index.js.ejs"), args),
                            promisifyEjs(path.join(__dirname, "../template/services/db/entity/create.js.ejs"), args),
                            promisifyEjs(path.join(__dirname, "../template/services/db/entity/edit.js.ejs"), args),
                            promisifyEjs(path.join(__dirname, "../template/services/db/entity/destroy.js.ejs"), args),
                            promisifyEjs(path.join(__dirname, "../template/services/db/entity/find-by-id.js.ejs"), args),
                            promisifyEjs(path.join(__dirname, "../template/services/db/entity/find-all.js.ejs"), args),
                            promisifyEjs(path.join(__dirname, "../template/services/db/entity/find-where-conditions.js.ejs"), args)
                        ];
                        return [4 /*yield*/, Promise.all(readTemplatePromises)];
                    case 2:
                        fileContents = _b.sent();
                        writePromises = [
                            write(path.join(process.cwd(), "/services/db/", modelFileName, "index.js"), fileContents[0]),
                            write(path.join(process.cwd(), "/services/db/", modelFileName, "create.js"), fileContents[1]),
                            write(path.join(process.cwd(), "/services/db/", modelFileName, "edit.js"), fileContents[2]),
                            write(path.join(process.cwd(), "/services/db/", modelFileName, "destroy.js"), fileContents[3]),
                            write(path.join(process.cwd(), "/services/db/", modelFileName, "find-by-id.js"), fileContents[4]),
                            write(path.join(process.cwd(), "/services/db/", modelFileName, "find-all.js"), fileContents[5]),
                            write(path.join(process.cwd(), "/services/db/", modelFileName, "find-where-conditions.js"), fileContents[6])
                        ];
                        return [4 /*yield*/, Promise.all(writePromises)];
                    case 3:
                        _b.sent();
                        dbIndexText = "// All db files are accessed through here\n\n";
                        return [4 /*yield*/, readFolders(path.join(process.cwd(), "/services/db"))];
                    case 4:
                        modelFolderGroups = _b.sent();
                        for (_i = 0, modelFolderGroups_1 = modelFolderGroups; _i < modelFolderGroups_1.length; _i++) {
                            group = modelFolderGroups_1[_i];
                            dbIndexText += "const " + _.camelCase(group) + " = require(\"./" + group + "\");\n";
                        }
                        dbIndexText += "\nmodule.exports = {\n";
                        for (_a = 0, modelFolderGroups_2 = modelFolderGroups; _a < modelFolderGroups_2.length; _a++) {
                            group = modelFolderGroups_2[_a];
                            dbIndexText += "    " + _.camelCase(group) + ": " + _.camelCase(group) + ",\n";
                        }
                        dbIndexText += "};";
                        return [4 /*yield*/, write(path.join(process.cwd(), "/services/db/index.js"), dbIndexText)];
                    case 5:
                        _b.sent();
                        log.info("DB files created successfully");
                        spinner.stop();
                        return [2 /*return*/, resolve()];
                    case 6:
                        err_4 = _b.sent();
                        spinner.stop();
                        return [2 /*return*/, reject(err_4)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    });
}
function createRouteFiles(model) {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var routesRootFolderPath, finalFolderPath, i, tempFolderPath, j, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the model.route array contains only the model name (i.e. has a size of one),
                        // then there're no path components, hence terminate here
                        if (model.route.length <= 1) {
                            return [2 /*return*/, resolve()];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 16, , 17]);
                        log.info("Creating route files for \"" + model.name + "\"");
                        spinner.start();
                        routesRootFolderPath = path.join(process.cwd(), "/routes/");
                        return [4 /*yield*/, createFolder(routesRootFolderPath)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(routesRootFolderPath, "index.js"))];
                    case 3:
                        _a.sent();
                        finalFolderPath = "";
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < model.route.length)) return [3 /*break*/, 8];
                        tempFolderPath = routesRootFolderPath;
                        for (j = 0; j <= i; j++) {
                            tempFolderPath = path.join(tempFolderPath, model.route[j]);
                        }
                        return [4 /*yield*/, createFolder(tempFolderPath)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(tempFolderPath, "index.js"))];
                    case 6:
                        _a.sent();
                        if (i == model.route.length - 1)
                            finalFolderPath = tempFolderPath;
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 4];
                    case 8: return [4 /*yield*/, createFile(path.join(finalFolderPath, "show-all.js"))];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "show-create.js"))];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "show-edit.js"))];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "show-one.js"))];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "create.js"))];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "edit.js"))];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "delete.js"))];
                    case 15:
                        _a.sent();
                        log.info("Route Files Created!");
                        spinner.stop();
                        return [2 /*return*/, resolve()];
                    case 16:
                        err_5 = _a.sent();
                        spinner.stop();
                        return [2 /*return*/, reject(err_5)];
                    case 17: return [2 /*return*/];
                }
            });
        });
    });
}
function createViewFiles(model, fileExtension) {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function () {
            var viewsRootFolderPath, finalFolderPath, i, tempFolderPath, j, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the model.view array contains only the model name (i.e. has a size of one),
                        // then there're no path components, hence terminate here
                        if (model.view.length <= 1) {
                            return [2 /*return*/, resolve()];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 19, , 20]);
                        log.info("Creating view files for \"" + model.name + "\"");
                        spinner.start();
                        viewsRootFolderPath = path.join(process.cwd(), "/views/");
                        return [4 /*yield*/, createFolder(viewsRootFolderPath)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, createFolder(path.join(viewsRootFolderPath, model.view[0]))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, createFolder(path.join(viewsRootFolderPath, model.view[0], "/components/"))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, createFolder(path.join(viewsRootFolderPath, model.view[0], "/essentials/"))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, createFolder(path.join(viewsRootFolderPath, model.view[0], "/pages/"))];
                    case 6:
                        _a.sent();
                        finalFolderPath = "";
                        i = 1;
                        _a.label = 7;
                    case 7:
                        if (!(i < model.route.length)) return [3 /*break*/, 10];
                        tempFolderPath = path.join(viewsRootFolderPath, model.view[0], "/pages/");
                        for (j = 1; j <= i; j++) {
                            tempFolderPath = path.join(tempFolderPath, model.view[j]);
                        }
                        return [4 /*yield*/, createFolder(tempFolderPath)];
                    case 8:
                        _a.sent();
                        if (i == model.route.length - 1)
                            finalFolderPath = tempFolderPath;
                        _a.label = 9;
                    case 9:
                        i++;
                        return [3 /*break*/, 7];
                    case 10:
                        fileExtension = fileExtension.trim().toLowerCase();
                        if (fileExtension.startsWith(".")) {
                            fileExtension = fileExtension.substring(1);
                        }
                        return [4 /*yield*/, createFile(path.join(viewsRootFolderPath, model.view[0], "/essentials/styles." + fileExtension))];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(viewsRootFolderPath, model.view[0], "/essentials/scripts." + fileExtension))];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, write(path.join(viewsRootFolderPath, model.view[0], "/essentials/styles." + fileExtension), "<!-- Place all common stylesheet <link> tags here -->")];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, write(path.join(viewsRootFolderPath, model.view[0], "/essentials/scripts." + fileExtension), "<!-- Place all common javascript <script> tags here -->")];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "show-all." + fileExtension))];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "show-create." + fileExtension))];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "show-edit." + fileExtension))];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, createFile(path.join(finalFolderPath, "show-one." + fileExtension))];
                    case 18:
                        _a.sent();
                        log.info("View Files Created!");
                        spinner.stop();
                        return [2 /*return*/, resolve()];
                    case 19:
                        err_6 = _a.sent();
                        spinner.stop();
                        return [2 /*return*/, reject(err_6)];
                    case 20: return [2 /*return*/];
                }
            });
        });
    });
}
