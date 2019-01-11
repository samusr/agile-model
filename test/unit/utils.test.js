const path = require("path");
const fse = require("fs-extra");
const { assert } = require("chai");
const {
    pathExists,
    createFile,
    createFolder,
    writeToFile,
    readFile,
    readFolder,
    deleteObject,
    namesGenerator,
    getRootDir
} = require("../../src/utils");

describe("Unit tests for utilities", () => {
    const testAppDirectory = path.join(__dirname, "../utils/");
    const folderPaths = ["folder-1", "folder-2", "folder-3"];
    const filePaths = ["file-1", "file-2", "file-3"];
    const testString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus hendrerit nisl vel interdum.";

    before(async () => {
        // Delete everything in 'testAppDirectory'
        fse.emptyDirSync(testAppDirectory);
    });

    it("should verify that test files and folders do not exist", () => {
        for (const path of [].concat(filePaths, folderPaths)) {
            assert.notEqual(pathExists(testAppDirectory + path), true);
        }
    });

    it("should create 3 files", () => {
        for (const path of filePaths) {
            assert.doesNotThrow(createFile.bind(null, testAppDirectory + path));
        }
    });

    it("should verify that files were created", () => {
        for (const path of filePaths) {
            assert.equal(pathExists(testAppDirectory + path), true);
        }
    });

    it("should create 3 folders", () => {
        for (const path of folderPaths) {
            assert.doesNotThrow(createFolder.bind(null, testAppDirectory + path));
        }
    });

    it("should verify that folders were created", () => {
        for (const path of folderPaths) {
            assert.equal(pathExists(testAppDirectory + path), true);
        }
    });

    it("should write to a file", () => {
        const path = testAppDirectory + filePaths[0];
        assert.doesNotThrow(writeToFile.bind(null, path, testString));
    });

    it("should verify that file was written to", () => {
        const path = testAppDirectory + filePaths[0];
        const content = readFile(path);
        assert.equal(testString, content);
    });

    it("should read folder contents", () => {
        const files = readFolder(testAppDirectory);
        assert.notEqual(files.length, 0);
    });

    it("should delete files and folders", () => {
        for (const path of [].concat(filePaths, folderPaths)) {
            assert.doesNotThrow(deleteObject.bind(null, testAppDirectory + path));
        }
    });

    it("should verify that files and folders have been deleted", () => {
        for (const path of [].concat(filePaths, folderPaths)) {
            assert.equal(pathExists(testAppDirectory + path), false);
        }
    });

    it("should generate model, table and file names for a given name", () => {
        const name = "user";
        assert.equal(namesGenerator.generateModelName(name), "User");
        assert.equal(namesGenerator.generateModelFilename(name), "user.js");
        assert.equal(namesGenerator.generateTablename(name), "users");
    });

    it("should return the correct root folder for development environment", () => {
        process.env.NODE_ENV = "development";
        assert.equal(getRootDir(), path.join(process.cwd(), "test/app/"));
    });

    it("should return the correct root folder for production environment", () => {
        process.env.NODE_ENV = "production";
        assert.equal(getRootDir(), path.join(process.cwd(), "/"));
    });
});
